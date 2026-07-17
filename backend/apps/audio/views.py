from datetime import datetime
from bson import ObjectId
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from common.permissions import can_manage_story, is_authenticated
from common.response import success, error
from apps.audio.models import ChapterDocument, ListeningProgressDocument
from apps.audio.serializers import ChapterSerializer, ProgressSerializer, chapter_to_dict, progress_to_dict
from apps.stories.models import StoryDocument
from apps.stories.serializers import can_access_story_media

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def chapters(request):
    if request.method == 'GET':
        story_id = request.GET.get('story_id')
        if not ObjectId.is_valid(story_id):
            return error('Invalid story id', 400)
        story = StoryDocument.objects(id=story_id).first()
        if not story or story.status != 'published':
            return error('Story not found', 404)
        include_media = can_access_story_media(story, request.user)

        qs = ChapterDocument.objects
        if story_id:
            qs = qs.filter(story_id=story_id)
        return success([chapter_to_dict(c, include_media) for c in qs.order_by('chapter_number')])
    serializer = ChapterSerializer(data=request.data)
    if not is_authenticated(request):
        return error('Authentication required', 401)
    story_id = request.data.get('story_id', '')
    if not ObjectId.is_valid(story_id):
        return error('Invalid story id', 400)
    story = StoryDocument.objects(id=story_id).first()
    if not story:
        return error('Story not found', 404)
    if not can_manage_story(request, story):
        return error('You cannot add chapters to this story', 403)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    chapter = ChapterDocument(**serializer.validated_data).save()
    return success(chapter_to_dict(chapter), 'Chapter created', 201)

@api_view(['GET'])
@permission_classes([AllowAny])
def story_chapters(request, story_id):
    if not ObjectId.is_valid(story_id):
        return error('Invalid story id', 400)
    story = StoryDocument.objects(id=story_id).first()
    if not story or story.status != 'published':
        return error('Story not found', 404)
    chapters = ChapterDocument.objects(story_id=story_id).order_by('chapter_number')
    include_media = can_access_story_media(story, request.user)
    return success([chapter_to_dict(c, include_media) for c in chapters])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_progress(request):
    serializer = ProgressSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    data = serializer.validated_data
    if not ObjectId.is_valid(data['story_id']) or not StoryDocument.objects(id=data['story_id']).first():
        return error('Story not found', 404)

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
