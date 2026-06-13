import os
import re
from datetime import datetime
from apps.stories.models import StoryDocument, AudioPartDocument
import fitz
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from openai import OpenAI
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from bson import ObjectId
from common.response import success, error
from apps.stories.models import StoryDocument
from apps.stories.serializers import StoryCreateSerializer, story_to_dict


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
    name = re.sub(r"\s+", " ", name).strip()
    return name.title() or "Untitled Story"


def save_uploaded_file(file_obj, folder):
    if not file_obj:
        return ""

    safe_name = file_obj.name.replace(" ", "_")
    safe_name = re.sub(r"[^a-zA-Z0-9._-]+", "_", safe_name)

    saved_path = default_storage.save(f"{folder}/{safe_name}", file_obj)

    try:
        full_path = default_storage.path(saved_path)
        print("FILE SAVED:", full_path)
        print("FILE EXISTS:", os.path.exists(full_path))
    except Exception as exc:
        print("FILE SAVE CHECK FAILED:", exc)

    return f"{settings.MEDIA_URL}{saved_path}"


def extract_pdf_info(book_url, original_filename):
    result = {
        "title": clean_filename_title(original_filename),
        "author": "Unknown Author",
        "description": "",
        "cover_image": "",
        "tts_text": "",
    }

    try:
        relative_path = book_url.replace(settings.MEDIA_URL, "", 1)
        pdf_path = default_storage.path(relative_path)

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

        # Limit for now so upload is fast. Increase later if needed.
        max_pages_for_audio = min(10, len(doc))

        for page_index in range(max_pages_for_audio):
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

            result["description"] = first_text[:700]

        full_text = "\n\n".join(all_text_parts)
        full_text = re.sub(r"\s+", " ", full_text).strip()

        # OpenAI TTS input should not be huge in one request.
        # This creates an audio preview from the first pages.
        result["tts_text"] = full_text[:12000]

        if len(doc) > 0:
            safe_name = os.path.splitext(original_filename.replace(" ", "_"))[0]
            safe_name = re.sub(r"[^a-zA-Z0-9_]+", "_", safe_name)

            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            cover_relative_path = f"covers/{safe_name}_{timestamp}_cover.png"

            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
            png_bytes = pix.tobytes("png")

            saved_cover_path = default_storage.save(
                cover_relative_path,
                ContentFile(png_bytes),
            )

            result["cover_image"] = f"{settings.MEDIA_URL}{saved_cover_path}"

            try:
                cover_full_path = default_storage.path(saved_cover_path)
                print("COVER SAVED:", cover_full_path)
                print("COVER EXISTS:", os.path.exists(cover_full_path))
            except Exception as exc:
                print("COVER SAVE CHECK FAILED:", exc)

        doc.close()

    except Exception as exc:
        print("PDF extraction failed:", exc)

    return result

def extract_pdf_full_text(book_url, max_pages=30):
    try:
        relative_path = book_url.replace(settings.MEDIA_URL, "", 1)
        pdf_path = default_storage.path(relative_path)

        if not os.path.exists(pdf_path):
            return "", "PDF file not found on server."

        doc = fitz.open(pdf_path)

        text_parts = []

        for page_index in range(min(max_pages, len(doc))):
            page_text = doc[page_index].get_text("text").strip()

            if page_text:
                text_parts.append(page_text)

        doc.close()

        full_text = "\n\n".join(text_parts)
        full_text = re.sub(r"\s+", " ", full_text).strip()

        if not full_text:
            return "", "No readable text found in PDF."

        return full_text, ""

    except Exception as exc:
        return "", str(exc)

def generate_audio_parts_from_text(text, title, max_parts=20):
    chunks = split_text_for_audio(text, max_chars=4500)

    if not chunks:
        return [], "No text chunks created."

    audio_parts = []
    errors = []

    for index, chunk in enumerate(chunks[:max_parts], start=1):
        audio_url, audio_error = generate_audio_from_text(
            text=chunk,
            title=title,
            part_number=index,
        )

        if audio_url:
            audio_parts.append(
                AudioPartDocument(
                    part_number=index,
                    title=f"Part {index}",
                    audio_url=audio_url,
                    text_preview=chunk[:180],
                    duration_estimate=5,
                    created_at=datetime.utcnow(),
                )
            )
        else:
            errors.append(f"Part {index}: {audio_error}")

    if not audio_parts:
        return [], "; ".join(errors) or "Audio generation failed."

    return audio_parts, "; ".join(errors)

def generate_audio_from_text(text, title, part_number=1):
    if not text:
        return "", "No text found inside PDF."

    if not settings.OPENAI_API_KEY:
        return "", "OPENAI_API_KEY is missing."

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        safe_title = re.sub(r"[^a-zA-Z0-9_]+", "_", title)[:70]
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

        audio_relative_path = (
            f"audio/{safe_title}_part_{part_number}_{timestamp}.mp3"
        )

        audio_full_path = os.path.join(settings.MEDIA_ROOT, audio_relative_path)
        os.makedirs(os.path.dirname(audio_full_path), exist_ok=True)

        speech_text = text[:4500].strip()

        if len(speech_text) < 20:
            return "", "Audio text is too short."

        with client.audio.speech.with_streaming_response.create(
            model="gpt-4o-mini-tts",
            voice="alloy",
            input=speech_text,
        ) as response:
            response.stream_to_file(audio_full_path)

        print("AUDIO PART SAVED:", audio_full_path)
        print("AUDIO PART EXISTS:", os.path.exists(audio_full_path))

        return f"{settings.MEDIA_URL}{audio_relative_path}", ""

    except Exception as exc:
        print("AUDIO PART GENERATION FAILED:", exc)
        return "", str(exc)

def split_text_for_audio(text, max_chars=4500):
    """
    Split PDF text into small chunks.
    Around 4000-4500 chars is usually safe for TTS limits.
    Each chunk becomes one audio part.
    """

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

    title = data.get("title") or pdf_info.get("title") or clean_filename_title(book_file.name)
    author = data.get("author") or pdf_info.get("author") or "Unknown Author"
    description = data.get("description") or pdf_info.get("description") or ""
    category = data.get("category") or "Book"

    if not cover_image:
        cover_image = pdf_info.get("cover_image", "")

    full_pdf_text, text_error = extract_pdf_full_text(book_url, max_pages=30)

    audio_parts = []
    audio_url = ""
    audio_error = ""

    if full_pdf_text:
        audio_parts, audio_error = generate_audio_parts_from_text(
            text=full_pdf_text,
            title=title,
            max_parts=20,
        )

        if audio_parts:
            audio_url = audio_parts[0].audio_url
    else:
        audio_error = text_error

    raw_tags = data.get("tags", "")
    tags = [tag.strip() for tag in raw_tags.split(",") if tag.strip()]

    story = StoryDocument(
        title=title,
        slug=make_slug(title),
        author=author,
        description=description,
        category=category,
        tags=tags,
        cover_image=cover_image,
        audio_url=audio_url,
        book_url=book_url,
        audio_parts=audio_parts,
        duration=len(audio_parts) * 5,
        is_premium=data.get("is_premium", False),
        uploaded_by=str(request.user.doc.id),
        audio_status="generated" if audio_parts else "failed",
        audio_error=audio_error,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    story.save()

    return success(story_to_dict(story), "PDF story uploaded with audio", 201)


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

    full_pdf_text, text_error = extract_pdf_full_text(story.book_url, max_pages=30)

    if not full_pdf_text:
        story.audio_status = "failed"
        story.audio_error = text_error
        story.updated_at = datetime.utcnow()
        story.save()

        return error(text_error, 400)

    audio_parts, audio_error = generate_audio_parts_from_text(
        text=full_pdf_text,
        title=story.title,
        max_parts=20,
    )

    story.audio_parts = audio_parts
    story.audio_url = audio_parts[0].audio_url if audio_parts else ""
    story.duration = len(audio_parts) * 5
    story.audio_status = "generated" if audio_parts else "failed"
    story.audio_error = audio_error
    story.updated_at = datetime.utcnow()
    story.save()

    return success(story_to_dict(story), "Audio parts generated successfully")

