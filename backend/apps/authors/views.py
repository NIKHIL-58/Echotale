from rest_framework.decorators import api_view
from common.response import success, error
from apps.authors.models import AuthorDocument
from apps.authors.serializers import AuthorSerializer, author_to_dict
from apps.stories.models import StoryDocument
from apps.stories.serializers import story_to_dict

@api_view(['GET', 'POST'])
def authors(request):
    if request.method == 'GET':
        items = AuthorDocument.objects.order_by('-followers_count')
        return success([author_to_dict(a) for a in items])
    serializer = AuthorSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    author = AuthorDocument(**serializer.validated_data).save()
    return success(author_to_dict(author), 'Author created', 201)

@api_view(['GET', 'PUT', 'DELETE'])
def author_detail(request, author_id):
    author = AuthorDocument.objects(id=author_id).first()
    if not author:
        return error('Author not found', 404)
    if request.method == 'GET':
        return success(author_to_dict(author))
    if request.method == 'DELETE':
        author.delete()
        return success(None, 'Author deleted')
    serializer = AuthorSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    for key, value in serializer.validated_data.items():
        setattr(author, key, value)
    author.save()
    return success(author_to_dict(author), 'Author updated')

@api_view(['GET'])
def author_stories(request, author_id):
    stories = StoryDocument.objects(author_id=author_id, status='published')
    return success([story_to_dict(s) for s in stories])
