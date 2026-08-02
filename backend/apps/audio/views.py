from datetime import datetime
from bson import ObjectId
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from common.permissions import can_manage_story,is_authenticated
from common.response import success,error
from apps.audio.models import ChapterDocument,ListeningProgressDocument,TimestampNoteDocument,OfflineDownloadDocument
from apps.audio.serializers import ChapterSerializer,ProgressSerializer,TimestampNoteSerializer,DownloadSerializer,chapter_to_dict,progress_to_dict,note_to_dict,download_to_dict
from apps.stories.models import StoryDocument
from apps.stories.serializers import can_access_story_media

def get_story(story_id): return StoryDocument.objects(id=story_id).first() if ObjectId.is_valid(story_id) else None
def upsert_progress(user_id,data):
 p=ListeningProgressDocument.objects(user_id=str(user_id),story_id=data['story_id']).first() or ListeningProgressDocument(user_id=str(user_id),story_id=data['story_id'])
 for key,value in data.items():setattr(p,key,value)
 p.percentage=min(100,(p.current_time/p.duration*100) if p.duration else data.get('percentage',0));p.completed=bool(data.get('completed',False) or (p.duration>0 and p.percentage>=98));p.last_played_at=datetime.utcnow();p.save();return p

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def chapters(request):
 if request.method=='GET':
  story_id=request.GET.get('story_id','');story=get_story(story_id)
  if not story:return error('Story not found',404)
  return success([chapter_to_dict(c,can_access_story_media(story,request.user)) for c in ChapterDocument.objects(story_id=story_id).order_by('chapter_number')])
 if not is_authenticated(request):return error('Authentication required',401)
 s=ChapterSerializer(data=request.data)
 if not s.is_valid():return error('Validation failed',errors=s.errors)
 story=get_story(s.validated_data['story_id'])
 if not story:return error('Story not found',404)
 if not can_manage_story(request,story):return error('You cannot add chapters to this story',403)
 return success(chapter_to_dict(ChapterDocument(**s.validated_data).save()),'Chapter created',201)

@api_view(['GET'])
@permission_classes([AllowAny])
def story_chapters(request,story_id):
 story=get_story(story_id)
 if not story or story.status!='published':return error('Story not found',404)
 return success([chapter_to_dict(c,can_access_story_media(story,request.user)) for c in ChapterDocument.objects(story_id=story_id).order_by('chapter_number')])

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def progress(request):
 if request.method=='GET':
  story_id=request.GET.get('story_id','');qs=ListeningProgressDocument.objects(user_id=str(request.user.id))
  if story_id:qs=qs.filter(story_id=story_id)
  items=list(qs.order_by('-last_played_at'));return success(progress_to_dict(items[0]) if story_id and items else ([] if not story_id and not items else ([progress_to_dict(i) for i in items] if not story_id else None)))
 s=ProgressSerializer(data=request.data)
 if not s.is_valid():return error('Validation failed',errors=s.errors)
 if not get_story(s.validated_data['story_id']):return error('Story not found',404)
 return success(progress_to_dict(upsert_progress(request.user.id,s.validated_data)),'Progress saved')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_progress(request):
 saved=[]
 for entry in request.data.get('entries',[])[:100]:
  s=ProgressSerializer(data=entry)
  if s.is_valid() and get_story(s.validated_data['story_id']):saved.append(progress_to_dict(upsert_progress(request.user.id,s.validated_data)))
 return success(saved,f'{len(saved)} progress records synchronized')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def continue_listening(request):return success([progress_to_dict(i) for i in ListeningProgressDocument.objects(user_id=str(request.user.id),completed=False).order_by('-last_played_at')])

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def notes(request):
 if request.method=='GET':
  qs=TimestampNoteDocument.objects(user_id=str(request.user.id));story_id=request.GET.get('story_id')
  if story_id:qs=qs.filter(story_id=story_id)
  return success([note_to_dict(n) for n in qs.order_by('timestamp')])
 s=TimestampNoteSerializer(data=request.data)
 if not s.is_valid():return error('Validation failed',errors=s.errors)
 if not get_story(s.validated_data['story_id']):return error('Story not found',404)
 return success(note_to_dict(TimestampNoteDocument(user_id=str(request.user.id),**s.validated_data).save()),'Timestamp note saved',201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_note(request,note_id):
 item=TimestampNoteDocument.objects(id=note_id,user_id=str(request.user.id)).first() if ObjectId.is_valid(note_id) else None
 if not item:return error('Note not found',404)
 item.delete();return success(None,'Note deleted')

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def downloads(request):
 if request.method=='GET':return success([download_to_dict(d) for d in OfflineDownloadDocument.objects(user_id=str(request.user.id)).order_by('-updated_at')])
 s=DownloadSerializer(data=request.data)
 if not s.is_valid():return error('Validation failed',errors=s.errors)
 data=s.validated_data
 if not get_story(data['story_id']):return error('Story not found',404)
 item=OfflineDownloadDocument.objects(user_id=str(request.user.id),story_id=data['story_id']).first() or OfflineDownloadDocument(user_id=str(request.user.id),story_id=data['story_id'])
 item.chapter_ids=data.get('chapter_ids',[]);item.total_bytes=data.get('total_bytes',0);item.updated_at=datetime.utcnow();item.save();return success(download_to_dict(item),'Offline download synchronized')

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_download(request,story_id):OfflineDownloadDocument.objects(user_id=str(request.user.id),story_id=story_id).delete();return success(None,'Offline download removed')
