from bson import ObjectId
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from common.response import success, error
from common.permissions import is_admin
from apps.authors.models import AuthorDocument
from apps.authors.serializers import AuthorSerializer, author_to_dict
from apps.stories.models import StoryDocument
from apps.stories.serializers import story_to_dict

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def authors(request):
    if request.method == 'GET':
        items = AuthorDocument.objects.order_by('-followers_count')
        return success([author_to_dict(a) for a in items])
    if not is_admin(request):
        return error('Administrator access is required', 403)
    serializer = AuthorSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    author = AuthorDocument(**serializer.validated_data).save()
    return success(author_to_dict(author), 'Author created', 201)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def author_detail(request, author_id):
    if not ObjectId.is_valid(author_id):
        return error('Invalid author id', 400)
    author = AuthorDocument.objects(id=author_id).first()
    if not author:
        return error('Author not found', 404)
    if request.method == 'GET':
        return success(author_to_dict(author))
    if not is_admin(request):
        return error('Administrator access is required', 403)
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
@permission_classes([AllowAny])
def author_stories(request, author_id):
    if not ObjectId.is_valid(author_id):
        return error('Invalid author id', 400)
    author = AuthorDocument.objects(id=author_id).first()
    if not author:
        return error('Author not found', 404)
    stories = StoryDocument.objects(author__iexact=author.name, status='published')
    return success([story_to_dict(s, request.user) for s in stories])
