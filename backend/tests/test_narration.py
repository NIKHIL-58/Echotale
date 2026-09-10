import os
import re
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

os.environ["MONGODB_URI"] = ""
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.stories.narration import detect_story_start, split_narration
from apps.stories.serializers import NarrationOptionsSerializer
from apps.stories import views

PROSE = "The traveller opened the old door and looked out into the quiet garden. " * 8
PAGES = ["Example Novel", "A novel by Example Author", "© 2026 Example Author\nAll rights reserved.\nThis book is a work of fiction.",
         "Contents\nPrologue 7\nChapter 1 9\nChapter 2 15", "Chapter 3 20\nChapter 4 30\nChapter 5 40\nChapter 6 50",
         "", "PROLOGUE\nTHE TRAVELLER\n" + PROSE, "CHAPTER ONE\n" + PROSE]


class DetectionTests(unittest.TestCase):
    def test_skips_cover_copyright_and_contents(self):
        result = detect_story_start(PAGES)
        self.assertEqual(result.page, 7)
        self.assertEqual(result.confidence, "high")

    def test_real_story_already_on_first_page_is_kept(self):
        self.assertEqual(detect_story_start(["Chapter 1\n" + PROSE]).page, 1)

    def test_hindi_chapter_heading(self):
        result = detect_story_start(["सर्वाधिकार सुरक्षित", "विषय सूची", "अध्याय १\n" + "वह घर वापस आया। उसके मन में कई सवाल थे। " * 8])
        self.assertEqual(result.page, 3)
        self.assertEqual(result.confidence, "high")

    def test_heading_on_separate_page_is_preserved(self):
        self.assertEqual(detect_story_start(["Cover", "PROLOGUE", PROSE]).page, 2)

    def test_unmarked_opening_is_not_skipped_for_later_chapter(self):
        self.assertEqual(detect_story_start([PROSE, "Chapter 1\n" + PROSE]).page, 1)

    def test_uncertain_document_requires_review(self):
        self.assertEqual(detect_story_start(["Cover", "", "One short line"]).confidence, "low")

    def test_short_table_of_contents_is_not_a_prologue(self):
        result = detect_story_start(["Contents\nPrologue\nChapter One\n" + PROSE, "Prologue\n" + PROSE])
        self.assertEqual(result.page, 2)

    def test_chunks_do_not_lose_long_sentences(self):
        text = " ".join(["longsentence"] * 1600) + ". The end."
        chunks = split_narration(text)
        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(0 < len(c) <= 4500 for c in chunks))
        self.assertEqual(" ".join(chunks), text)

    def test_hindi_sentence_boundaries_and_whitespace(self):
        text = ("वह आया।\nवह बैठा।\n" * 300)
        chunks = split_narration(text, 300)
        self.assertTrue(all(len(c) <= 300 for c in chunks))
        self.assertEqual(" ".join(chunks), re.sub(r"\s+", " ", text).strip())

    def test_unbroken_token_is_not_dropped(self):
        chunks = split_narration("x" * 10000)
        self.assertEqual("".join(chunks), "x" * 10000)
        self.assertTrue(all(len(c) <= 4500 for c in chunks))

    def test_short_ending_is_not_sent_as_an_unreadable_tts_fragment(self):
        text = ("word " * 900) + "The end."
        chunks = split_narration(text)
        self.assertTrue(all(20 <= len(c) <= 4500 for c in chunks))
        self.assertEqual(" ".join(chunks), text)

    def test_invalid_page_option(self):
        for value in (0, -1, "oops", 1.5):
            self.assertFalse(NarrationOptionsSerializer(data={"start_page": value}).is_valid())
        self.assertTrue(NarrationOptionsSerializer(data={"start_page": None}).is_valid())


class ExtractionTests(unittest.TestCase):
    def extract(self, pages, **kwargs):
        doc = MagicMock()
        doc.__enter__.return_value = doc
        doc.__len__.return_value = len(pages)
        doc.__getitem__.side_effect = pages.__getitem__
        with patch.object(views, "get_pdf_local_path", return_value=("dummy.pdf", False)), \
             patch.object(views.fitz, "open", return_value=doc), \
             patch.object(views, "extract_page_text", side_effect=lambda p: p):
            return views.extract_pdf_narration("dummy.pdf", **kwargs)

    def test_narration_starts_at_the_prologue(self):
        text, info = self.extract(PAGES)
        self.assertTrue(text.startswith("PROLOGUE"))
        self.assertNotIn("All rights reserved", text)
        self.assertEqual(info["start_page"], 7)

    def test_manual_override_can_include_page_one(self):
        text, info = self.extract(PAGES, start_page=1)
        self.assertTrue(text.startswith("Example Novel"))
        self.assertEqual(info["confidence"], "manual")

    def test_manual_page_range_is_checked(self):
        with self.assertRaises(ValueError):
            self.extract(PAGES, start_page=99)

    def test_unknown_opening_does_not_generate_wrong_audio(self):
        with self.assertRaisesRegex(ValueError, "uncertain"):
            self.extract(["A sparse page", "Another sparse page"])
        _, info = self.extract(["A sparse page"], preview=True)
        self.assertEqual(info["confidence"], "low")

    def test_page_limit_is_applied_after_story_start_and_disclosed(self):
        _, info = self.extract(PAGES, max_pages=1)
        self.assertTrue(info["limited"])
        self.assertEqual(info["end_page"], 7)

    def test_later_common_opening_phrase_does_not_remove_earlier_text(self):
        text = "The story really starts here. Much later: When we were children we listened."
        self.assertEqual(views.clean_text_for_tts(text), text)

    def test_preview_is_owner_only_and_does_not_call_extraction_for_strangers(self):
        request = APIRequestFactory().get("/?start_page=7")
        force_authenticate(request, user=SimpleNamespace(id="stranger", is_authenticated=True, doc=SimpleNamespace(role="user")))
        story = SimpleNamespace(uploaded_by="owner", book_url="private.pdf")
        with patch.object(views.StoryDocument, "objects") as objects, patch.object(views, "extract_pdf_narration") as extract:
            objects.return_value.first.return_value = story
            response = views.narration_preview(request, "507f1f77bcf86cd799439011")
            self.assertEqual(response.status_code, 403)
            extract.assert_not_called()


class GenerationTests(unittest.TestCase):
    def story(self):
        return SimpleNamespace(id="story", title="Example", book_url="dummy", narration_start_page=7,
                               narration_info={}, audio_parts=["original"], audio_url="original.mp3", voice="alloy",
                               duration=10, audio_status="generated", audio_error="", save=MagicMock())

    def run_generation(self, story, responses, **kwargs):
        info = {"limited": False, "start_page": 7}
        with patch.object(views.StoryDocument, "objects") as objects, \
             patch.object(views, "extract_pdf_narration", return_value=(PROSE * 20, info)), \
             patch.object(views, "split_text_for_audio", return_value=[PROSE, PROSE, PROSE]), \
             patch.object(views, "generate_audio_from_text", side_effect=responses) as tts:
            objects.return_value.first.return_value = story
            views.generate_audio_parts_background("story", **kwargs)
            return tts.call_count

    def test_failure_does_not_skip_a_part_and_claim_success(self):
        story = self.story()
        count = self.run_generation(story, [("part1.mp3", ""), ("", "provider unavailable")])
        self.assertEqual(count, 2)
        self.assertEqual(story.audio_status, "failed")
        self.assertEqual([p.part_number for p in story.audio_parts], [1])
        self.assertIn("part 2", story.audio_error)

    def test_first_part_failure_preserves_original_audio(self):
        story = self.story()
        self.run_generation(story, [("", "unavailable")])
        self.assertEqual(story.audio_parts, ["original"])
        self.assertEqual(story.audio_url, "original.mp3")

    def test_truncation_is_marked_partial(self):
        story = self.story()
        self.run_generation(story, [("new.mp3", "")], max_parts=1)
        self.assertEqual(story.audio_status, "partial")
        self.assertIn("processing limits", story.audio_error)


if __name__ == "__main__":
    unittest.main()
