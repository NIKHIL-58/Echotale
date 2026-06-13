from rest_framework import serializers


class StoryCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=200)
    author = serializers.CharField(required=False, allow_blank=True, max_length=120)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.CharField(required=False, allow_blank=True)

    cover_image = serializers.CharField(required=False, allow_blank=True)
    audio_url = serializers.CharField(required=False, allow_blank=True)
    book_url = serializers.CharField(required=False, allow_blank=True)

    duration = serializers.IntegerField(required=False)
    is_premium = serializers.BooleanField(required=False)


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
        "duration": story.duration,
        "rating": story.rating,
        "total_reviews": story.total_reviews,
        "total_listens": story.total_listens,
        "uploaded_by": story.uploaded_by,
        "is_premium": story.is_premium,
        "status": story.status,
        "created_at": story.created_at.isoformat() if story.created_at else None,
    }