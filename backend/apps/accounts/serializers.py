from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, required=False)
    avatar = serializers.CharField(required=False, allow_blank=True)
    language = serializers.CharField(required=False)
    favorite_genres = serializers.ListField(child=serializers.CharField(), required=False)
    listening_goal = serializers.IntegerField(required=False)

def user_to_dict(user):
    return {
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'avatar': user.avatar,
        'role': user.role,
        'is_premium': user.is_premium,
        'favorite_genres': user.favorite_genres,
        'language': user.language,
        'listening_goal': user.listening_goal,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }
