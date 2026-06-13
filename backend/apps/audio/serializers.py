from rest_framework import serializers

class ChapterSerializer(serializers.Serializer):
    story_id = serializers.CharField()
    title = serializers.CharField()
    chapter_number = serializers.IntegerField(required=False)
    duration = serializers.IntegerField(required=False)
    audio_url = serializers.CharField(required=False, allow_blank=True)

class ProgressSerializer(serializers.Serializer):
    story_id = serializers.CharField()
    chapter_id = serializers.CharField(required=False, allow_blank=True)
    current_time = serializers.IntegerField(default=0)
    duration = serializers.IntegerField(default=0)
    percentage = serializers.IntegerField(default=0)
    completed = serializers.BooleanField(required=False)

def chapter_to_dict(chapter):
    return {'id': str(chapter.id), 'story_id': chapter.story_id, 'title': chapter.title, 'chapter_number': chapter.chapter_number, 'duration': chapter.duration, 'audio_url': chapter.audio_url}

def progress_to_dict(progress):
    return {'id': str(progress.id), 'user_id': progress.user_id, 'story_id': progress.story_id, 'chapter_id': progress.chapter_id, 'current_time': progress.current_time, 'duration': progress.duration, 'percentage': progress.percentage, 'completed': progress.completed, 'last_played_at': progress.last_played_at.isoformat()}
