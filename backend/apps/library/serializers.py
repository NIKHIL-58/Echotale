from rest_framework import serializers
class LibrarySerializer(serializers.Serializer):
    story_id = serializers.CharField()
    status = serializers.CharField(required=False)
    is_downloaded = serializers.BooleanField(required=False)
def library_to_dict(item):
    return {'id': str(item.id), 'user_id': item.user_id, 'story_id': item.story_id, 'status': item.status, 'is_downloaded': item.is_downloaded, 'added_at': item.added_at.isoformat()}
