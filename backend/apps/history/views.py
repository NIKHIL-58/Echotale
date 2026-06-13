from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.history.models import HistoryDocument
from apps.history.serializers import HistorySerializer, history_to_dict
@api_view(['GET','POST','DELETE'])
@permission_classes([IsAuthenticated])
def history(request):
    if request.method == 'GET': return success([history_to_dict(h) for h in HistoryDocument.objects(user_id=request.user.id).order_by('-played_at')])
    if request.method == 'DELETE':
        HistoryDocument.objects(user_id=request.user.id).delete(); return success(None,'History cleared')
    serializer=HistorySerializer(data=request.data)
    if not serializer.is_valid(): return error('Validation failed', errors=serializer.errors)
    item=HistoryDocument(user_id=request.user.id, **serializer.validated_data).save()
    return success(history_to_dict(item), 'History saved', 201)
