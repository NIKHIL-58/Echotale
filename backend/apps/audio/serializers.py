from rest_framework import serializers

class ChapterSerializer(serializers.Serializer):
    story_id=serializers.CharField(); title=serializers.CharField(); chapter_number=serializers.IntegerField(required=False); duration=serializers.IntegerField(required=False); audio_url=serializers.CharField(required=False,allow_blank=True)

class ProgressSerializer(serializers.Serializer):
    story_id=serializers.CharField(); chapter_id=serializers.CharField(required=False,allow_blank=True); current_time=serializers.FloatField(default=0,min_value=0); duration=serializers.FloatField(default=0,min_value=0); percentage=serializers.FloatField(default=0,min_value=0,max_value=100); completed=serializers.BooleanField(required=False)

class TimestampNoteSerializer(serializers.Serializer):
    story_id=serializers.CharField(); chapter_id=serializers.CharField(required=False,allow_blank=True); timestamp=serializers.FloatField(default=0,min_value=0); note=serializers.CharField(max_length=1000)

class DownloadSerializer(serializers.Serializer):
    story_id=serializers.CharField(); chapter_ids=serializers.ListField(child=serializers.CharField(),required=False); total_bytes=serializers.FloatField(default=0,min_value=0)

def chapter_to_dict(c,include_media=True): return {'id':str(c.id),'story_id':c.story_id,'title':c.title,'chapter_number':c.chapter_number,'duration':c.duration,'audio_url':c.audio_url if include_media else ''}
def progress_to_dict(p): return {'id':str(p.id),'user_id':p.user_id,'story_id':p.story_id,'chapter_id':p.chapter_id,'current_time':p.current_time,'duration':p.duration,'percentage':p.percentage,'completed':p.completed,'last_played_at':p.last_played_at.isoformat()}
def note_to_dict(n): return {'id':str(n.id),'story_id':n.story_id,'chapter_id':n.chapter_id,'timestamp':n.timestamp,'note':n.note,'created_at':n.created_at.isoformat(),'updated_at':n.updated_at.isoformat()}
def download_to_dict(d): return {'id':str(d.id),'story_id':d.story_id,'chapter_ids':d.chapter_ids,'total_bytes':d.total_bytes,'downloaded_at':d.downloaded_at.isoformat(),'updated_at':d.updated_at.isoformat()}
