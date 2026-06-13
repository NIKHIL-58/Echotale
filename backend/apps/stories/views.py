import os
import re
from datetime import datetime
from django.core.files.base import ContentFile
import fitz
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated

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

    filename = file_obj.name.replace(" ", "_")
    path = default_storage.save(f"{folder}/{filename}", file_obj)

    return f"{settings.MEDIA_URL}{path}"


def extract_pdf_info(book_url, original_filename):
    result = {
        "title": clean_filename_title(original_filename),
        "author": "Unknown Author",
        "description": "",
        "cover_image": "",
    }

    try:
        relative_path = book_url.replace(settings.MEDIA_URL, "", 1)
        pdf_path = os.path.join(settings.MEDIA_ROOT, relative_path)

        if not os.path.exists(pdf_path):
            print("PDF file not found:", pdf_path)
            return result

        doc = fitz.open(pdf_path)

        metadata = doc.metadata or {}

        meta_title = (metadata.get("title") or "").strip()
        meta_author = (metadata.get("author") or "").strip()

        if meta_title:
            result["title"] = meta_title

        if meta_author:
            result["author"] = meta_author

        first_text = ""

        for page_index in range(min(3, len(doc))):
            page_text = doc[page_index].get_text("text").strip()
            if page_text:
                first_text = page_text
                break

        if first_text:
            lines = [line.strip() for line in first_text.splitlines() if line.strip()]

            if not meta_title and lines:
                possible_title = lines[0]
                if len(possible_title) <= 120:
                    result["title"] = possible_title

            if not meta_author:
                for line in lines[:10]:
                    if line.lower().startswith("by "):
                        result["author"] = line[3:].strip() or "Unknown Author"
                        break

            result["description"] = first_text[:700]

        if len(doc) > 0:
            safe_name = os.path.splitext(original_filename.replace(" ", "_"))[0]
            safe_name = re.sub(r"[^a-zA-Z0-9_]+", "_", safe_name)

            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            cover_filename = f"{safe_name}_{timestamp}_cover.png"
            cover_relative_path = f"covers/{cover_filename}"

            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)

            png_bytes = pix.tobytes("png")

            saved_path = default_storage.save(
                cover_relative_path,
                ContentFile(png_bytes),
            )

            result["cover_image"] = f"{settings.MEDIA_URL}{saved_path}"

            print("Cover saved:", result["cover_image"])

        doc.close()

    except Exception as exc:
        print("PDF extraction failed:", exc)

    return result

    
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

    cover_file = request.FILES.get("cover_file")
    audio_file = request.FILES.get("audio_file")
    book_file = request.FILES.get("book_file")

    if not book_file and not data.get("book_url"):
        return error("Please upload a PDF book file.", 400)

    book_url = save_uploaded_file(book_file, "books") or data.get("book_url", "")
    audio_url = save_uploaded_file(audio_file, "audio") or data.get("audio_url", "")
    cover_image = save_uploaded_file(cover_file, "covers") or data.get("cover_image", "")

    pdf_info = {
        "title": "",
        "author": "",
        "description": "",
        "cover_image": "",
    }

    if book_file and book_url.lower().endswith(".pdf"):
        pdf_info = extract_pdf_info(book_url, book_file.name)

    title = data.get("title") or pdf_info.get("title") or "Untitled Story"
    author = data.get("author") or pdf_info.get("author") or "Unknown Author"
    description = data.get("description") or pdf_info.get("description") or ""
    category = data.get("category") or "Book"

    if not cover_image:
        cover_image = pdf_info.get("cover_image", "")

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
        duration=data.get("duration", 0),
        is_premium=data.get("is_premium", False),
        uploaded_by=str(request.user.doc.id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    story.save()

    return success(story_to_dict(story), "PDF story uploaded successfully", 201)


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