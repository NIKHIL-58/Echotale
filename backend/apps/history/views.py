from rest_framework.decorators import api_view, permission_classes
from datetime import datetime
from bson import ObjectId
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.history.models import HistoryDocument
from apps.history.serializers import HistorySerializer, history_to_dict
from apps.stories.models import StoryDocument
@api_view(['GET','POST','DELETE'])
@permission_classes([IsAuthenticated])
def history(request):
    if request.method == 'GET': return success([history_to_dict(h) for h in HistoryDocument.objects(user_id=request.user.id).order_by('-played_at')])
    if request.method == 'DELETE':
        HistoryDocument.objects(user_id=request.user.id).delete(); return success(None,'History cleared')
    serializer=HistorySerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    data = serializer.validated_data
    if not ObjectId.is_valid(data['story_id']) or not StoryDocument.objects(id=data['story_id'], status='published').first():
        return error('Story not found', 404)
    item = HistoryDocument.objects(user_id=request.user.id, story_id=data['story_id']).first()
    if not item:
        item = HistoryDocument(user_id=request.user.id, story_id=data['story_id'])
    for key, value in data.items():
        setattr(item, key, value)
    item.played_at = datetime.utcnow()
    item.save()
    return success(history_to_dict(item), 'History saved', 201)
