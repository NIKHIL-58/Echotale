from rest_framework.decorators import api_view
from common.response import success
from apps.stories.models import StoryDocument
from apps.stories.serializers import story_to_dict
@api_view(['GET'])
def recommended(request):
    qs = StoryDocument.objects(status='published').order_by('-rating','-total_listens').limit(10)
    return success([story_to_dict(s) for s in qs])
@api_view(['GET'])
def trending(request):
    qs = StoryDocument.objects(status='published').order_by('-total_listens').limit(10)
    return success([story_to_dict(s) for s in qs])
