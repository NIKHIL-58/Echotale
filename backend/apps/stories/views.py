import os
import re
import json
from collections import Counter
import tempfile
import threading
import subprocess
import shutil
from datetime import datetime

import fitz
import requests
from bson import ObjectId
from django.conf import settings
from openai import OpenAI
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import success, error
from common.permissions import can_manage_story
from common.supabase_storage import upload_django_file, upload_bytes, upload_local_file
from apps.stories.models import StoryDocument, AudioPartDocument
from apps.stories.serializers import StoryCreateSerializer, NarrationOptionsSerializer, story_to_dict
from apps.stories.narration import detect_story_start, split_narration


ALLOWED_VOICES = [
    "alloy",
    "ash",
    "ballad",
    "coral",
    "echo",
    "fable",
    "nova",
    "onyx",
    "sage",
    "shimmer",
]


def normalize_voice(voice):
    voice = (voice or "alloy").strip()

    if voice not in ALLOWED_VOICES:
        return "alloy"

    return voice


def make_slug(title):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    slug = slug or "story"

    base_slug = slug
    count = 1

    while StoryDocument.objects(slug=slug).first():
        count += 1
        slug = f"{base_slug}-{count}"

    return slug


def clean_filename_title(filename):
    name = os.path.splitext(filename)[0]
    name = name.replace("_", " ").replace("-", " ")
    name = re.sub(r"\bbook\b", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\bpdf\b", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\s+", " ", name).strip()
    return name.title() or "Untitled Story"


def clean_story_title(title, original_filename=""):
    title = (title or "").strip()

    bad_titles = [
        "learn english through story",
        "short story",
        "untitled story",
    ]

    lower_title = title.lower()

    if lower_title in bad_titles or "learn english through story" in lower_title:
        filename_title = clean_filename_title(original_filename)

        if "last leaf" in filename_title.lower():
            return "The Last Leaf"

        return filename_title or "Untitled Story"

    title = re.sub(r"learn english through story", "", title, flags=re.IGNORECASE)
    title = re.sub(r"level\s*\d+[-ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“]\d+", "", title, flags=re.IGNORECASE)
    title = re.sub(r"https?://\S+", "", title)
    title = re.sub(r"www\.\S+", "", title)
    title = re.sub(r"\s+", " ", title).strip()

    return title or clean_filename_title(original_filename)


def clean_story_description(description):
    if not description:
        return ""

    text = description.replace("\r", "\n")

    remove_patterns = [
        r"learn english through story",
        r"level\s*\d+[-ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“]\d+",
        r"hope you have enjoyed the reading",
        r"come back to.*",
        r"https?://\S+",
        r"www\.\S+",
        r"find more fascinating.*",
    ]

    for pattern in remove_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    text = re.sub(r"\s+", " ", text).strip()

    markers = [
        "In a little district",
        "One dollar and eighty-seven cents",
        "When we were children",
        "I became what I am today",
    ]

    for marker in markers:
        index = text.lower().find(marker.lower())
        if index != -1:
            text = text[index:]
            break

    return text.strip()


def clean_text_for_tts(text):
    if not text:
        return ""

    text = text.replace("\r", "\n")

    lines = []
    skip_patterns = [
        r"learn english through story",
        r"level\s*\d+[-ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“]\d+",
        r"hope you have enjoyed the reading",
        r"come back to",
        r"https?://",
        r"www\.",
        r"find more fascinating",
        r"courtesy:",
        r"shahid riaz",
        r"islamabad",
        r"gmail\.com",
        r"oceanofpdf",
    ]

    for line in text.splitlines():
        clean_line = line.strip()

        if not clean_line:
            continue

        lower_line = clean_line.lower()

        if any(re.search(pattern, lower_line) for pattern in skip_patterns):
            continue

        lines.append(clean_line)

    cleaned = "\n".join(lines)

    cleaned = re.sub(r"https?://\S+", "", cleaned)
    cleaned = re.sub(r"www\.\S+", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def text_extraction_is_corrupt(text):
    """Detect broken ToUnicode mappings commonly found in older Hindi PDFs."""
    if not text or len(text.strip()) < 30:
        return False
    devanagari = sum(1 for char in text if "\u0900" <= char <= "\u097f")
    suspicious = sum(1 for char in text if "\u0180" <= char <= "\u02ff")
    replacement = text.count("ï¿½")
    return replacement > 1 or suspicious >= 4 or (devanagari > 10 and suspicious > devanagari * 0.04)


def ocr_page_text(page, languages="hin+eng"):
    """OCR one rendered page when its embedded Unicode mapping is unreliable."""
    executable = os.getenv("TESSERACT_CMD") or shutil.which("tesseract")
    tessdata = os.path.join(settings.BASE_DIR, "ocr_data")
    if not executable or not os.path.exists(os.path.join(tessdata, "hin.traineddata")):
        return ""
    image_path = ""
    try:
        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        image_path = temp_image.name
        temp_image.close()
        page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), alpha=False).save(image_path)
        process = subprocess.run(
            [executable, image_path, "stdout", "-l", languages, "--tessdata-dir", tessdata, "--psm", "6"],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=45,
            check=False,
        )
        return process.stdout.decode("utf-8", errors="replace").strip() if process.returncode == 0 else ""
    except Exception as exc:
        print("HINDI OCR FAILED:", exc)
        return ""
    finally:
        if image_path and os.path.exists(image_path):
            try: os.remove(image_path)
            except Exception: pass


def extract_page_text(page):
    embedded = page.get_text("text").strip()
    if text_extraction_is_corrupt(embedded):
        corrected = ocr_page_text(page)
        if len(corrected) >= max(30, int(len(embedded) * 0.45)):
            return corrected
    return embedded

def save_uploaded_file(file_obj, folder):
    if not file_obj:
        return ""

    return upload_django_file(file_obj, folder)


def get_pdf_local_path(book_url):
    if book_url.startswith("http"):
        response = requests.get(book_url, timeout=120)
        response.raise_for_status()

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_file.write(response.content)
        temp_file.close()

        return temp_file.name, True

    relative_path = book_url.replace(settings.MEDIA_URL, "", 1)
    local_path = os.path.join(settings.MEDIA_ROOT, relative_path)

    return local_path, False


def extract_pdf_info(book_url, original_filename):
    result = {
        "title": clean_filename_title(original_filename),
        "author": "Unknown Author",
        "description": "",
        "cover_image": "",
        "tts_text": "",
    }

    pdf_path = ""
    should_delete = False
    doc = None

    try:
        pdf_path, should_delete = get_pdf_local_path(book_url)

        print("PDF PATH:", pdf_path)
        print("PDF EXISTS:", os.path.exists(pdf_path))

        if not os.path.exists(pdf_path):
            return result

        doc = fitz.open(pdf_path)
        metadata = doc.metadata or {}

        meta_title = (metadata.get("title") or "").strip()
        meta_author = (metadata.get("author") or "").strip()

        if meta_title:
            result["title"] = meta_title

        if meta_author:
            result["author"] = meta_author

        all_text_parts = []
        first_text = ""

        max_pages_for_preview = min(10, len(doc))

        for page_index in range(max_pages_for_preview):
            page_text = extract_page_text(doc[page_index])

            if page_text:
                if not first_text and len(re.sub(r"\s+", "", page_text)) >= 80:
                    first_text = page_text

                all_text_parts.append(page_text)

        if first_text:
            lines = [line.strip() for line in first_text.splitlines() if line.strip()]

            if not meta_title and lines:
                possible_title = lines[0]

                if len(possible_title) <= 120:
                    result["title"] = possible_title

            if not meta_author:
                for line in lines[:12]:
                    if line.lower().startswith("by "):
                        result["author"] = line[3:].strip() or "Unknown Author"
                        break

            result["description"] = first_text[:1200]

        full_text = "\n\n".join(all_text_parts)
        result["tts_text"] = clean_text_for_tts(full_text)[:12000]

        if len(doc) > 0:
            safe_name = os.path.splitext(original_filename.replace(" ", "_"))[0]
            safe_name = re.sub(r"[^a-zA-Z0-9_]+", "_", safe_name)

            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            cover_filename = f"{safe_name}_{timestamp}_cover.png"

            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
            png_bytes = pix.tobytes("png")

            result["cover_image"] = upload_bytes(
                file_bytes=png_bytes,
                folder="covers",
                filename=cover_filename,
                content_type="image/png",
            )

    except Exception as exc:
        print("PDF extraction failed:", exc)

    finally:
        if doc:
            try:
                doc.close()
            except Exception:
                pass

        if should_delete and pdf_path and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception:
                pass

    return result


def extract_pdf_full_text(book_url, max_pages=100):
    pdf_path = ""
    should_delete = False
    doc = None

    try:
        pdf_path, should_delete = get_pdf_local_path(book_url)

        if not os.path.exists(pdf_path):
            return "", "PDF file not found on server."

        doc = fitz.open(pdf_path)
        text_parts = []

        for page_index in range(min(max_pages, len(doc))):
            page_text = extract_page_text(doc[page_index])

            if page_text:
                text_parts.append(page_text)

        full_text = "\n\n".join(text_parts)
        full_text = clean_text_for_tts(full_text)

        if not full_text:
            return "", "No readable text found in PDF."

        return full_text, ""

    except Exception as exc:
        return "", str(exc)

    finally:
        if doc:
            try:
                doc.close()
            except Exception:
                pass

        if should_delete and pdf_path and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception:
                pass


def extract_pdf_narration(book_url, start_page=None, preview=False, max_pages=100):
    pdf_path, should_delete = get_pdf_local_path(book_url)
    try:
        with fitz.open(pdf_path) as doc:
            if not len(doc):
                raise ValueError("The PDF has no pages.")
            if start_page is not None and not 1 <= start_page <= len(doc):
                raise ValueError(f"Start page must be between 1 and {len(doc)}.")
            cache = {}
            def page_text(index):
                if index not in cache:
                    cache[index] = extract_page_text(doc[index])
                return cache[index]
            if start_page is None:
                detected = detect_story_start([page_text(i) for i in range(min(40, len(doc)))])
                selected = detected.page
                confidence, reason = detected.confidence, detected.reason
            else:
                selected, confidence, reason = start_page, "manual", "Using your chosen PDF page."
            end_page = min(len(doc), selected - 1 + max_pages)
            info = {
                "start_page": selected, "total_pages": len(doc), "end_page": end_page,
                "confidence": confidence, "reason": reason,
                "preview": clean_text_for_tts(page_text(selected - 1))[:700],
                "limited": end_page < len(doc),
            }
            if preview:
                return "", info
            if confidence == "low":
                raise ValueError("Story start is uncertain. Preview the narration and choose a PDF start page before generating.")
            text = clean_text_for_tts("\n".join(page_text(i) for i in range(selected - 1, end_page)))
            if not text:
                raise ValueError("No readable text found from this page. This PDF may need OCR.")
            return text, info
    finally:
        if should_delete and os.path.exists(pdf_path):
            os.remove(pdf_path)


def split_text_for_audio(text, max_chars=4500):
    return split_narration(text, max_chars)


def generate_audio_from_text(text, title, part_number=1, voice="alloy"):
    if not text:
        return "", "No text found inside PDF."

    if not settings.OPENAI_API_KEY:
        return "", "OPENAI_API_KEY is missing."

    audio_full_path = ""

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        safe_title = re.sub(r"[^a-zA-Z0-9_]+", "_", title)[:70]
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

        audio_filename = f"{safe_title}_part_{part_number}_{timestamp}.mp3"

        temp_audio_dir = os.path.join(tempfile.gettempdir(), "echotale_audio")
        os.makedirs(temp_audio_dir, exist_ok=True)

        audio_full_path = os.path.join(temp_audio_dir, audio_filename)

        speech_text = text[:4500].strip()

        if len(speech_text) < 20:
            return "", "Audio text is too short."

        with client.audio.speech.with_streaming_response.create(
            model="gpt-4o-mini-tts",
            voice=normalize_voice(voice),
            input=speech_text,
        ) as response:
            response.stream_to_file(audio_full_path)

        print("AUDIO PART SAVED TEMP:", audio_full_path)
        print("AUDIO PART EXISTS:", os.path.exists(audio_full_path))

        audio_url = upload_local_file(
            audio_full_path,
            "audio",
            filename=audio_filename,
            content_type="audio/mpeg",
        )

        return audio_url, ""

    except Exception as exc:
        print("AUDIO PART GENERATION FAILED:", exc)
        return "", str(exc)

    finally:
        if audio_full_path and os.path.exists(audio_full_path):
            try:
                os.remove(audio_full_path)
            except Exception:
                pass


def generate_audio_parts_background(story_id, max_pages=100, max_parts=80):
    try:
        story = StoryDocument.objects(id=story_id).first()

        if not story:
            return

        story.audio_status = "generating"
        story.audio_error = ""
        story.updated_at = datetime.utcnow()
        story.save()

        full_pdf_text, narration_info = extract_pdf_narration(
            story.book_url,
            start_page=getattr(story, "narration_start_page", None),
            max_pages=max_pages,
        )

        if not full_pdf_text:
            story.audio_status = "failed"
            story.audio_error = "No readable narration text found."
            story.updated_at = datetime.utcnow()
            story.save()
            return

        chunks = split_text_for_audio(full_pdf_text, max_chars=4500)

        if not chunks:
            story.audio_status = "failed"
            story.audio_error = "No audio chunks created."
            story.updated_at = datetime.utcnow()
            story.save()
            return

        total_duration = 0
        generated_parts = []
        failure = ""
        narration_info["part_limit_reached"] = len(chunks) > max_parts
        voice = normalize_voice(getattr(story, "voice", "alloy"))

        for index, chunk in enumerate(chunks[:max_parts], start=1):
            audio_url, audio_error = generate_audio_from_text(
                text=chunk,
                title=story.title,
                part_number=index,
                voice=voice,
            )

            if not audio_url:
                failure = f"Generation stopped at part {index}: {audio_error or 'Unable to generate audio.'}"
                break

            duration_estimate = max(1, round(len(chunk.split()) / 150))

            part = AudioPartDocument(
                part_number=index,
                title=f"Part {index}",
                audio_url=audio_url,
                text_preview=chunk[:180],
                duration_estimate=duration_estimate,
                created_at=datetime.utcnow(),
            )

            generated_parts.append(part)
            story.audio_parts = generated_parts
            story.audio_url = generated_parts[0].audio_url
            story.narration_info = narration_info

            total_duration += duration_estimate
            story.duration = total_duration
            story.audio_status = "generating"
            story.updated_at = datetime.utcnow()
            story.save()

        limited = narration_info["limited"] or narration_info["part_limit_reached"]
        if generated_parts and not failure and not limited:
            story.audio_status = "generated"
            story.audio_error = ""
        else:
            story.audio_status = "failed" if failure or not generated_parts else "partial"
            story.audio_error = failure or (
                f"Only part of this book was generated (processing limits: {max_pages} PDF pages / {max_parts} audio parts)."
                if limited else "No audio parts generated."
            )

        story.updated_at = datetime.utcnow()
        story.save()

    except Exception as exc:
        print("BACKGROUND AUDIO GENERATION FAILED:", exc)

        story = StoryDocument.objects(id=story_id).first()

        if story:
            story.audio_status = "failed"
            story.audio_error = str(exc)
            story.updated_at = datetime.utcnow()
            story.save()


@api_view(["GET"])
@permission_classes([AllowAny])
def story_list(request):
    search = request.GET.get("search", "").strip()
    category = request.GET.get("category", "").strip()

    stories = StoryDocument.objects(status="published").order_by("-created_at")

    if search:
        stories = stories.filter(title__icontains=search)

    if category:
        stories = stories.filter(category__iexact=category)

    return success(
        [story_to_dict(story, request.user) for story in stories],
        "Stories fetched successfully",
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def story_detail(request, story_id):
    if not ObjectId.is_valid(story_id):
        return error("Invalid story id", 400)

    story = StoryDocument.objects(id=story_id).first()

    if not story:
        return error("Story not found", 404)

    if story.status != "published" and not can_manage_story(request, story):
        return error("Story not found", 404)

    story.total_listens += 1
    story.save()

    return success(story_to_dict(story, request.user), "Story fetched successfully")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_story(request):
    serializer = StoryCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    data = serializer.validated_data

    book_file = request.FILES.get("book_file")
    cover_file = request.FILES.get("cover_file")
    audio_file = request.FILES.get("audio_file")

    if not book_file:
        return error("Please upload a PDF book file.", 400)

    if not book_file.name.lower().endswith(".pdf"):
        return error("Only PDF book files are supported.", 400)
    if book_file.size > settings.MAX_PDF_UPLOAD_SIZE:
        return error("PDF file is too large (maximum 25 MB).", 400)
    signature = book_file.read(5)
    book_file.seek(0)
    if signature != b"%PDF-":
        return error("The uploaded book is not a valid PDF file.", 400)
    if cover_file and (
        cover_file.size > settings.MAX_MEDIA_UPLOAD_SIZE
        or not (cover_file.content_type or "").startswith("image/")
    ):
        return error("Cover must be an image smaller than 20 MB.", 400)
    if audio_file and (
        audio_file.size > settings.MAX_MEDIA_UPLOAD_SIZE
        or not (audio_file.content_type or "").startswith("audio/")
    ):
        return error("Audio must be an audio file smaller than 20 MB.", 400)

    book_url = save_uploaded_file(book_file, "books")
    cover_image = save_uploaded_file(cover_file, "covers") if cover_file else ""
    provided_audio_url = save_uploaded_file(audio_file, "audio") if audio_file else ""

    pdf_info = {
        "title": "",
        "author": "",
        "description": "",
        "cover_image": "",
        "tts_text": "",
    }

    if book_file.name.lower().endswith(".pdf"):
        pdf_info = extract_pdf_info(book_url, book_file.name)

    raw_title = data.get("title") or pdf_info.get("title") or clean_filename_title(book_file.name)
    raw_description = data.get("description") or pdf_info.get("description") or ""

    title = clean_story_title(raw_title, book_file.name)
    author = data.get("author") or pdf_info.get("author") or "Unknown Author"
    description = clean_story_description(raw_description)
    category = data.get("category") or "Book"

    if not cover_image:
        cover_image = pdf_info.get("cover_image", "")

    raw_tags = data.get("tags", "")
    tags = [tag.strip() for tag in raw_tags.split(",") if tag.strip()]

    voice = normalize_voice(data.get("voice") or "alloy")

    story = StoryDocument(
        title=title,
        slug=make_slug(title),
        author=author,
        description=description,
        category=category,
        tags=tags,
        cover_image=cover_image,
        audio_url=provided_audio_url,
        book_url=book_url,
        audio_parts=[],
        duration=data.get("duration", 0) if provided_audio_url else 0,
        is_premium=data.get("is_premium", False),
        uploaded_by=str(request.user.doc.id),
        audio_status="generated" if provided_audio_url else "generating",
        audio_error="",
        voice=voice,
        narration_start_page=data.get("narration_start_page"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    story.save()

    if not provided_audio_url:
        threading.Thread(
            target=generate_audio_parts_background,
            args=(str(story.id),),
            daemon=True,
        ).start()

    return success(
        story_to_dict(story, request.user),
        "Story uploaded successfully."
        if provided_audio_url
        else "PDF story uploaded successfully. Audio generation has started.",
        201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_stories(request):
    stories = StoryDocument.objects(
        uploaded_by=str(request.user.doc.id)
    ).order_by("-created_at")

    return success(
        [story_to_dict(story, request.user) for story in stories],
        "My stories fetched successfully",
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def regenerate_story_audio_parts(request, story_id):
    if not ObjectId.is_valid(story_id):
        return error("Invalid story id", 400)

    story = StoryDocument.objects(id=story_id).first()

    if not story:
        return error("Story not found", 404)

    if not can_manage_story(request, story):
        return error("You can only generate audio for your own story.", 403)

    if not story.book_url:
        return error("This story does not have a PDF file.", 400)

    options = NarrationOptionsSerializer(data=request.data)
    if not options.is_valid():
        return error("Start page must be a positive PDF page number, or null for automatic detection.", 400)
    if story.audio_status == "generating":
        return error("Audio is already generating. Please wait for it to finish.", 409)
    start_page = options.validated_data.get("start_page", getattr(story, "narration_start_page", None))
    try:
        _, info = extract_pdf_narration(story.book_url, start_page=start_page, preview=True)
        if info["confidence"] == "low":
            return error("Please choose the PDF page where the story starts.", 400)
    except ValueError as exc:
        return error(str(exc), 400)
    except Exception:
        return error("Unable to read this PDF. Check the file and try again.", 422)
    # Acquire the generation state atomically; do not discard existing audio on a failed attempt.
    claimed = StoryDocument.objects(id=story.id, audio_status__ne="generating").modify(
        new=True, set__audio_status="generating",
        set__audio_error="", set__narration_start_page=start_page,
        set__voice=normalize_voice(request.data.get("voice") or story.voice),
        set__updated_at=datetime.utcnow(),
    )
    if not claimed:
        return error("Audio is already generating. Please wait for it to finish.", 409)
    story = claimed

    threading.Thread(
        target=generate_audio_parts_background,
        args=(str(story.id),),
        daemon=True,
    ).start()

    return success(
        story_to_dict(story, request.user),
        "Audio regeneration has started.",
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def narration_preview(request, story_id):
    story = StoryDocument.objects(id=story_id).first() if ObjectId.is_valid(story_id) else None
    if not story:
        return error("Story not found", 404)
    if not can_manage_story(request, story):
        return error("You can only preview narration for your own story.", 403)
    if not story.book_url:
        return error("This story does not have a PDF.", 400)
    value = request.query_params.get("start_page")
    options = NarrationOptionsSerializer(data={"start_page": value or None})
    if not options.is_valid():
        return error("Enter a positive PDF page number.", 400)
    try:
        _, info = extract_pdf_narration(story.book_url, start_page=options.validated_data["start_page"], preview=True)
        return success(info, "Narration preview ready.")
    except ValueError as exc:
        return error(str(exc), 400)
    except Exception:
        return error("Unable to read this PDF. Check the file and try again.", 422)

def _fallback_story_insights(story, source_text):
    text = re.sub(r"\s+", " ", source_text or story.description or "").strip()
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 35]
    summary = " ".join(sentences[:5])[:1800]
    if not summary:
        summary = f"{story.title} by {story.author} is a {story.category.lower()} story. Open the book to explore its characters, events, and central ideas."
    stop = {"this","that","with","from","have","were","their","there","about","which","would","could","into","when","what","your","story","book","they","them","then","than","been","being","through","after","before","while","where","also","only","some","more","very"}
    words = re.findall(r"[A-Za-z][A-Za-z'-]{3,}", text.lower())
    keywords = [word for word,_ in Counter(w for w in words if w not in stop).most_common(6)]
    points = []
    for sentence in sentences[1:8]:
        clean = sentence[:220].strip()
        if clean and clean not in points: points.append(clean)
        if len(points) == 4: break
    if not points:
        points = [f"The story is written by {story.author}.", f"It is presented as {story.category} content.", "Its central events and character choices shape the narrative."]
    themes = [word.title() for word in keywords[:5]] or list(story.tags[:5]) or [story.category]
    questions = [
        {"question":"What is the story mainly about?","answer":summary},
        {"question":"Who are the important characters or voices?","answer":points[0]},
        {"question":"What themes should I notice while reading?","answer":"Key ideas include " + ", ".join(themes) + "."},
        {"question":"What is one important takeaway?","answer":points[-1]},
    ]
    return {"summary":summary,"key_points":points,"themes":themes,"questions":questions,"generated_by":"local"}


def _generate_story_insights(story, source_text):
    fallback = _fallback_story_insights(story, source_text)
    if not settings.OPENAI_API_KEY or len(source_text.strip()) < 120:
        return fallback
    prompt = f'''Create spoiler-aware reading insights for the story "{story.title}" by {story.author}.
Return strict JSON with: summary (3-6 short paragraphs as one string), key_points (4-7 concise strings), themes (3-6 strings), questions (4-6 objects with question and answer). Use only the supplied text; do not invent facts.
STORY TEXT:\n{source_text[:24000]}'''
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(model="gpt-4o-mini",temperature=0.2,response_format={"type":"json_object"},messages=[{"role":"system","content":"You produce accurate, concise book study guides as JSON."},{"role":"user","content":prompt}])
        data = json.loads(response.choices[0].message.content or "{}")
        if data.get("summary") and data.get("key_points") and data.get("questions"):
            data["generated_by"] = "ai"
            return data
    except Exception as exc:
        print("STORY INSIGHTS GENERATION FAILED:", exc)
    return fallback


@api_view(['GET','POST'])
@permission_classes([AllowAny])
def story_insights(request, story_id):
    story = StoryDocument.objects(id=story_id).first() if ObjectId.is_valid(story_id) else None
    if not story or story.status != "published":
        return error("Story not found", 404)
    cached = getattr(story, "insights", None) or {}
    if request.method == "GET" and cached.get("summary"):
        return success(cached)
    source_text = story.description or ""
    if story.book_url:
        pdf_text, _ = extract_pdf_full_text(story.book_url, max_pages=30)
        if pdf_text: source_text = pdf_text
    if not source_text and story.audio_parts:
        source_text = " ".join(part.text_preview for part in story.audio_parts if part.text_preview)
    insights = _generate_story_insights(story, source_text)
    insights["generated_at"] = datetime.utcnow().isoformat()
    story.insights = insights
    story.updated_at = datetime.utcnow()
    story.save()
    return success(insights, "Story insights generated")
