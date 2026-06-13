from rest_framework import serializers


class StoryCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=200)
    author = serializers.CharField(required=False, allow_blank=True, max_length=120)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.IntegerField(required=False)
    is_premium = serializers.BooleanField(required=False)


def audio_part_to_dict(part):
    return {
        "part_number": part.part_number,
        "title": part.title,
        "audio_url": part.audio_url,
        "text_preview": part.text_preview,
        "duration_estimate": part.duration_estimate,
        "created_at": part.created_at.isoformat() if part.created_at else None,
    }


def story_to_dict(story):
    return {
        "id": str(story.id),
        "title": story.title,
        "slug": story.slug,
        "author": story.author,
        "description": story.description,
        "category": story.category,
        "tags": story.tags,
        "cover_image": story.cover_image,
        "audio_url": story.audio_url,
        "book_url": story.book_url,
        "audio_parts": [audio_part_to_dict(part) for part in story.audio_parts],
        "duration": story.duration,
        "rating": story.rating,
        "total_reviews": story.total_reviews,
        "total_listens": story.total_listens,
        "uploaded_by": story.uploaded_by,
        "is_premium": story.is_premium,
        "status": story.status,
        "audio_status": story.audio_status,
        "audio_error": story.audio_error,
        "created_at": story.created_at.isoformat() if story.created_at else None,
    }