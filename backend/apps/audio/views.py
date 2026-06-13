from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.audio.models import ChapterDocument, ListeningProgressDocument
from apps.audio.serializers import ChapterSerializer, ProgressSerializer, chapter_to_dict, progress_to_dict

@api_view(['GET', 'POST'])
def chapters(request):
    if request.method == 'GET':
        story_id = request.GET.get('story_id')
        qs = ChapterDocument.objects
        if story_id:
            qs = qs.filter(story_id=story_id)
        return success([chapter_to_dict(c) for c in qs.order_by('chapter_number')])
    serializer = ChapterSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    chapter = ChapterDocument(**serializer.validated_data).save()
    return success(chapter_to_dict(chapter), 'Chapter created', 201)

@api_view(['GET'])
def story_chapters(request, story_id):
    chapters = ChapterDocument.objects(story_id=story_id).order_by('chapter_number')
    return success([chapter_to_dict(c) for c in chapters])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_progress(request):
    serializer = ProgressSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    data = serializer.validated_data
    progress = ListeningProgressDocument.objects(user_id=request.user.id, story_id=data['story_id']).first()
    if not progress:
        progress = ListeningProgressDocument(user_id=request.user.id, story_id=data['story_id'])
    for key, value in data.items():
        setattr(progress, key, value)
    progress.last_played_at = datetime.utcnow()
    progress.save()
    return success(progress_to_dict(progress), 'Progress saved')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def continue_listening(request):
    items = ListeningProgressDocument.objects(user_id=request.user.id, completed=False).order_by('-last_played_at')
    return success([progress_to_dict(i) for i in items])
