from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.bookmarks.models import BookmarkDocument
from apps.bookmarks.serializers import BookmarkSerializer, bookmark_to_dict
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def bookmarks(request):
    if request.method == 'GET':
        return success([bookmark_to_dict(b) for b in BookmarkDocument.objects(user_id=request.user.id).order_by('-created_at')])
    serializer=BookmarkSerializer(data=request.data)
    if not serializer.is_valid(): return error('Validation failed', errors=serializer.errors)
    bookmark=BookmarkDocument(user_id=request.user.id, **serializer.validated_data).save()
    return success(bookmark_to_dict(bookmark), 'Bookmark added', 201)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_bookmark(request, bookmark_id):
    bookmark=BookmarkDocument.objects(id=bookmark_id, user_id=request.user.id).first()
    if not bookmark: return error('Bookmark not found',404)
    bookmark.delete(); return success(None,'Bookmark deleted')
