from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.notifications.models import NotificationDocument
from apps.notifications.serializers import NotificationSerializer, notification_to_dict
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def notifications(request):
    if request.method == 'GET':
        unread=request.GET.get('unread')
        qs=NotificationDocument.objects(user_id=request.user.id)
        if unread == 'true': qs=qs.filter(is_read=False)
        return success([notification_to_dict(n) for n in qs.order_by('-created_at')])
    serializer=NotificationSerializer(data=request.data)
    if not serializer.is_valid(): return error('Validation failed', errors=serializer.errors)
    data=serializer.validated_data; data['user_id']=data.get('user_id') or request.user.id
    n=NotificationDocument(**data).save(); return success(notification_to_dict(n),'Notification created',201)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    n=NotificationDocument.objects(id=notification_id, user_id=request.user.id).first()
    if not n: return error('Notification not found',404)
    n.is_read=True; n.save(); return success(notification_to_dict(n),'Marked as read')
