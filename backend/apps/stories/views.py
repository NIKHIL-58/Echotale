from rest_framework.decorators import api_view
from common.response import success, error
from apps.stories.models import StoryDocument, CategoryDocument
from apps.stories.serializers import StorySerializer, CategorySerializer, story_to_dict, category_to_dict

@api_view(['GET', 'POST'])
def stories(request):
    if request.method == 'GET':
        qs = StoryDocument.objects(status='published')
        category = request.GET.get('category')
        search = request.GET.get('search') or request.GET.get('q')
        sort = request.GET.get('sort', '-created_at')
        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(title__icontains=search)
        if sort == 'popular':
            qs = qs.order_by('-total_listens')
        elif sort == 'rating':
            qs = qs.order_by('-rating')
        else:
            qs = qs.order_by('-created_at')
        return success([story_to_dict(s) for s in qs])
    serializer = StorySerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    if StoryDocument.objects(slug=serializer.validated_data['slug']).first():
        return error('Story slug already exists')
    story = StoryDocument(**serializer.validated_data).save()
    return success(story_to_dict(story), 'Story created', 201)

@api_view(['GET', 'PUT', 'DELETE'])
def story_detail(request, story_id):
    story = StoryDocument.objects(id=story_id).first() or StoryDocument.objects(slug=story_id).first()
    if not story:
        return error('Story not found', 404)
    if request.method == 'GET':
        return success(story_to_dict(story))
    if request.method == 'DELETE':
        story.delete()
        return success(None, 'Story deleted')
    serializer = StorySerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    for key, value in serializer.validated_data.items():
        setattr(story, key, value)
    story.save()
    return success(story_to_dict(story), 'Story updated')

@api_view(['GET', 'POST'])
def categories(request):
    if request.method == 'GET':
        return success([category_to_dict(c) for c in CategoryDocument.objects.order_by('name')])
    serializer = CategorySerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    category = CategoryDocument(**serializer.validated_data).save()
    return success(category_to_dict(category), 'Category created', 201)
