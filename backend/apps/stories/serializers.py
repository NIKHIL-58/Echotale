from rest_framework import serializers


class StoryCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=200)
    author = serializers.CharField(required=False, allow_blank=True, max_length=120)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.IntegerField(required=False)
    is_premium = serializers.BooleanField(required=False)
    voice = serializers.CharField(required=False, allow_blank=True)
    narration_start_page = serializers.IntegerField(required=False, allow_null=True, min_value=1)


class NarrationOptionsSerializer(serializers.Serializer):
    start_page = serializers.IntegerField(required=False, allow_null=True, min_value=1)


def can_access_story_media(story, user=None):
    if not story.is_premium:
        return True
    if not user or not getattr(user, "is_authenticated", False):
        return False
    user_doc = getattr(user, "doc", None)
    return bool(
        user_doc
        and (user_doc.is_premium or user_doc.role == "admin")
    ) or story.uploaded_by == str(user.id)


def audio_part_to_dict(part, include_media=True):
    return {
        "part_number": part.part_number,
        "title": part.title,
        "audio_url": part.audio_url if include_media else "",
        "text_preview": part.text_preview,
        "duration_estimate": part.duration_estimate,
        "created_at": part.created_at.isoformat() if part.created_at else None,
    }


def story_to_dict(story, user=None):
    include_media = can_access_story_media(story, user)
    return {
        "id": str(story.id),
        "title": story.title,
        "slug": story.slug,
        "author": story.author,
        "description": story.description,
        "category": story.category,
        "tags": story.tags,
        "cover_image": story.cover_image,
        "audio_url": story.audio_url if include_media else "",
        "book_url": story.book_url if include_media else "",
        "audio_parts": [
            audio_part_to_dict(part, include_media) for part in story.audio_parts
        ],
        "duration": story.duration,
        "rating": story.rating,
        "total_reviews": story.total_reviews,
        "total_listens": story.total_listens,
        "uploaded_by": story.uploaded_by,
        "is_premium": story.is_premium,
        "status": story.status,
        "audio_status": story.audio_status,
        "audio_error": story.audio_error if include_media else "",
        "voice": getattr(story, "voice", "alloy"),
        "narration_start_page": getattr(story, "narration_start_page", None),
        "narration_info": getattr(story, "narration_info", {}) if include_media else {},
        "can_manage": bool(user and getattr(user, "is_authenticated", False) and (
            story.uploaded_by == str(user.id) or getattr(getattr(user, "doc", None), "role", "") == "admin"
        )),
        "created_at": story.created_at.isoformat() if story.created_at else None,
    }
