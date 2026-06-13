from rest_framework import serializers
class BookmarkSerializer(serializers.Serializer):
    story_id = serializers.CharField()
    chapter_id = serializers.CharField(required=False, allow_blank=True)
    timestamp = serializers.IntegerField(default=0)
    note = serializers.CharField(required=False, allow_blank=True)
def bookmark_to_dict(b):
    return {'id': str(b.id), 'user_id': b.user_id, 'story_id': b.story_id, 'chapter_id': b.chapter_id, 'timestamp': b.timestamp, 'note': b.note, 'created_at': b.created_at.isoformat()}
