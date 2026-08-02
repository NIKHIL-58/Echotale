from datetime import datetime
from mongoengine import Document, StringField, IntField, FloatField, BooleanField, DateTimeField, ListField

class ChapterDocument(Document):
    story_id = StringField(required=True)
    title = StringField(required=True)
    chapter_number = IntField(default=1)
    duration = IntField(default=0)
    audio_url = StringField(default='')
    created_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'chapters', 'indexes': ['story_id']}

class ListeningProgressDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    chapter_id = StringField(default='')
    current_time = FloatField(default=0)
    duration = FloatField(default=0)
    percentage = FloatField(default=0)
    completed = BooleanField(default=False)
    last_played_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'listening_progress', 'indexes': [{'fields': ['user_id', 'story_id'], 'unique': True}]}

class TimestampNoteDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    chapter_id = StringField(default='')
    timestamp = FloatField(default=0)
    note = StringField(required=True, max_length=1000)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'timestamp_notes', 'indexes': ['user_id', 'story_id', 'chapter_id']}

class OfflineDownloadDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    chapter_ids = ListField(StringField(), default=[])
    total_bytes = FloatField(default=0)
    downloaded_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'offline_downloads', 'indexes': [{'fields': ['user_id', 'story_id'], 'unique': True}]}
