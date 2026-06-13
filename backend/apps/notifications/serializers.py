from rest_framework import serializers
class NotificationSerializer(serializers.Serializer):
    user_id = serializers.CharField(required=False)
    title = serializers.CharField()
    message = serializers.CharField(required=False, allow_blank=True)
    type = serializers.CharField(required=False)
def notification_to_dict(n):
    return {'id': str(n.id), 'user_id': n.user_id, 'title': n.title, 'message': n.message, 'type': n.type, 'is_read': n.is_read, 'created_at': n.created_at.isoformat()}
