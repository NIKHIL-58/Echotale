import os
import re
import tempfile
import threading
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
from common.supabase_storage import upload_django_file, upload_bytes, upload_local_file
from apps.stories.models import StoryDocument, AudioPartDocument
from apps.stories.serializers import StoryCreateSerializer, story_to_dict


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
    title = re.sub(r"level\s*\d+[-–]\d+", "", title, flags=re.IGNORECASE)
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
        r"level\s*\d+[-–]\d+",
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
        r"level\s*\d+[-–]\d+",
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

    start_markers = [
        "In a little district",
        "One dollar and eighty-seven cents",
        "When we were children",
        "I became what I am today",
    ]

    for marker in start_markers:
        index = cleaned.lower().find(marker.lower())
        if index != -1:
            cleaned = cleaned[index:]
            break

    cleaned = re.sub(r"https?://\S+", "", cleaned)
    cleaned = re.sub(r"www\.\S+", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


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
            page_text = doc[page_index].get_text("text").strip()

            if page_text:
                if not first_text:
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
            page_text = doc[page_index].get_text("text").strip()

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


def split_text_for_audio(text, max_chars=4500):
    if not text:
        return []

    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)

    chunks = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()

        if not sentence:
            continue

        if len(current) + len(sentence) + 1 <= max_chars:
            current = f"{current} {sentence}".strip()
        else:
            if current:
                chunks.append(current)

            current = sentence

    if current:
        chunks.append(current)

    return chunks


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

        full_pdf_text, text_error = extract_pdf_full_text(
            story.book_url,
            max_pages=max_pages,
        )

        if not full_pdf_text:
            story.audio_status = "failed"
            story.audio_error = text_error
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

        story.audio_parts = []
        story.audio_url = ""
        story.duration = 0
        story.updated_at = datetime.utcnow()
        story.save()

        total_duration = 0
        voice = normalize_voice(getattr(story, "voice", "alloy"))

        for index, chunk in enumerate(chunks[:max_parts], start=1):
            audio_url, audio_error = generate_audio_from_text(
                text=chunk,
                title=story.title,
                part_number=index,
                voice=voice,
            )

            if not audio_url:
                story.audio_error = audio_error or f"Part {index} failed."
                story.updated_at = datetime.utcnow()
                story.save()
                continue

            duration_estimate = max(1, round(len(chunk.split()) / 150))

            part = AudioPartDocument(
                part_number=index,
                title=f"Part {index}",
                audio_url=audio_url,
                text_preview=chunk[:180],
                duration_estimate=duration_estimate,
                created_at=datetime.utcnow(),
            )

            story.audio_parts.append(part)

            if not story.audio_url:
                story.audio_url = audio_url

            total_duration += duration_estimate
            story.duration = total_duration
            story.audio_status = "generating"
            story.updated_at = datetime.utcnow()
            story.save()

        if story.audio_parts:
            story.audio_status = "generated"
            story.audio_error = ""
        else:
            story.audio_status = "failed"
            story.audio_error = story.audio_error or "No audio parts generated."

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
        [story_to_dict(story) for story in stories],
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

    story.total_listens += 1
    story.save()

    return success(story_to_dict(story), "Story fetched successfully")


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

    if not book_file:
        return error("Please upload a PDF book file.", 400)

    book_url = save_uploaded_file(book_file, "books")
    cover_image = save_uploaded_file(cover_file, "covers") if cover_file else ""

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
        audio_url="",
        book_url=book_url,
        audio_parts=[],
        duration=0,
        is_premium=data.get("is_premium", False),
        uploaded_by=str(request.user.doc.id),
        audio_status="generating",
        audio_error="",
        voice=voice,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    story.save()

    threading.Thread(
        target=generate_audio_parts_background,
        args=(str(story.id),),
        daemon=True,
    ).start()

    return success(
        story_to_dict(story),
        "PDF story uploaded successfully. Audio generation has started.",
        201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_stories(request):
    stories = StoryDocument.objects(
        uploaded_by=str(request.user.doc.id)
    ).order_by("-created_at")

    return success(
        [story_to_dict(story) for story in stories],
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

    if story.uploaded_by != str(request.user.doc.id):
        return error("You can only generate audio for your own story.", 403)

    if not story.book_url:
        return error("This story does not have a PDF file.", 400)

    story.voice = normalize_voice(
        request.data.get("voice") or getattr(story, "voice", "alloy")
    )
    story.audio_status = "generating"
    story.audio_error = ""
    story.audio_parts = []
    story.audio_url = ""
    story.duration = 0
    story.updated_at = datetime.utcnow()
    story.save()

    threading.Thread(
        target=generate_audio_parts_background,
        args=(str(story.id),),
        daemon=True,
    ).start()

    return success(
        story_to_dict(story),
        "Audio regeneration has started.",
    )
