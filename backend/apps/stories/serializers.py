from rest_framework import serializers
from django.utils.text import slugify

class StorySerializer(serializers.Serializer):
    title = serializers.CharField(max_length=180)
    slug = serializers.CharField(required=False, allow_blank=True)
    author_id = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    cover_image = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.IntegerField(required=False)
    audio_url = serializers.CharField(required=False, allow_blank=True)
    is_premium = serializers.BooleanField(required=False)
    status = serializers.CharField(required=False)

    def validate(self, attrs):
        if not attrs.get('slug') and attrs.get('title'):
            attrs['slug'] = slugify(attrs['title'])
        return attrs

class CategorySerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField(required=False)
    icon = serializers.CharField(required=False)
    color = serializers.CharField(required=False)

    def validate(self, attrs):
        if not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])
        return attrs

def story_to_dict(story):
    return {
        'id': str(story.id),
        'title': story.title,
        'slug': story.slug,
        'author_id': story.author_id,
        'description': story.description,
        'category': story.category,
        'tags': story.tags,
        'cover_image': story.cover_image,
        'duration': story.duration,
        'audio_url': story.audio_url,
        'is_premium': story.is_premium,
        'rating': story.rating,
        'total_reviews': story.total_reviews,
        'total_listens': story.total_listens,
        'status': story.status,
    }

def category_to_dict(category):
    return {'id': str(category.id), 'name': category.name, 'slug': category.slug, 'icon': category.icon, 'color': category.color}
