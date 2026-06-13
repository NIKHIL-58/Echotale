from rest_framework import serializers

class AuthorSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)
    cover_image = serializers.CharField(required=False, allow_blank=True)
    genres = serializers.ListField(child=serializers.CharField(), required=False)

def author_to_dict(author):
    return {
        'id': str(author.id),
        'name': author.name,
        'bio': author.bio,
        'avatar': author.avatar,
        'cover_image': author.cover_image,
        'genres': author.genres,
        'followers_count': author.followers_count,
    }
