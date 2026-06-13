from rest_framework import serializers
class HistorySerializer(serializers.Serializer):
    story_id = serializers.CharField()
    chapter_id = serializers.CharField(required=False, allow_blank=True)
    action = serializers.CharField(required=False)
def history_to_dict(h):
    return {'id': str(h.id), 'user_id': h.user_id, 'story_id': h.story_id, 'chapter_id': h.chapter_id, 'action': h.action, 'played_at': h.played_at.isoformat()}
