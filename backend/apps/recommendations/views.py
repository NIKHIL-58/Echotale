from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from common.response import success
from apps.stories.models import StoryDocument
from apps.stories.serializers import story_to_dict
from apps.audio.models import ListeningProgressDocument

def score_story(story,genres,tags,authors,seen):
 score=float(story.rating or 0)*2+min(int(story.total_listens or 0),1000)/200
 if story.category.lower() in genres:score+=8
 score+=len(set(t.lower() for t in story.tags)&tags)*3
 if story.author.lower() in authors:score+=4
 if str(story.id) in seen:score-=12
 return score

@api_view(['GET'])
@permission_classes([AllowAny])
def recommended(request):
 stories=list(StoryDocument.objects(status='published').limit(150))
 genres=set();tags=set();authors=set();seen=set()
 if getattr(request.user,'is_authenticated',False):
  doc=getattr(request.user,'doc',None)
  genres={g.lower() for g in (getattr(doc,'favorite_genres',[]) or [])}
  progress=list(ListeningProgressDocument.objects(user_id=str(request.user.id)).order_by('-last_played_at').limit(30))
  seen={p.story_id for p in progress}
  for item in StoryDocument.objects(id__in=[p.story_id for p in progress if p.story_id]):
   genres.add((item.category or '').lower());tags.update(t.lower() for t in item.tags);authors.add((item.author or '').lower())
 ranked=sorted(stories,key=lambda s:score_story(s,genres,tags,authors,seen),reverse=True)[:12]
 return success([story_to_dict(s,request.user) for s in ranked])

@api_view(['GET'])
@permission_classes([AllowAny])
def trending(request):
 return success([story_to_dict(s,request.user) for s in StoryDocument.objects(status='published').order_by('-total_listens','-rating').limit(10)])
