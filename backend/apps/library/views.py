from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.library.models import LibraryDocument
from apps.library.serializers import LibrarySerializer, library_to_dict

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def library(request):
    if request.method == 'GET':
        status = request.GET.get('status')
        qs = LibraryDocument.objects(user_id=request.user.id)
        if status:
            qs = qs.filter(status=status)
        return success([library_to_dict(i) for i in qs.order_by('-added_at')])
    serializer = LibrarySerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    item = LibraryDocument.objects(user_id=request.user.id, story_id=serializer.validated_data['story_id']).first()
    if not item:
        item = LibraryDocument(user_id=request.user.id, **serializer.validated_data)
    else:
        for key, value in serializer.validated_data.items():
            setattr(item, key, value)
    item.save()
    return success(library_to_dict(item), 'Added to library', 201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_library_item(request, story_id):
    item = LibraryDocument.objects(user_id=request.user.id, story_id=story_id).first()
    if not item:
        return error('Library item not found', 404)
    item.delete()
    return success(None, 'Removed from library')
