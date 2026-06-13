from datetime import datetime
from mongoengine import Document, StringField, IntField, BooleanField, DateTimeField

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
    current_time = IntField(default=0)
    duration = IntField(default=0)
    percentage = IntField(default=0)
    completed = BooleanField(default=False)
    last_played_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'listening_progress', 'indexes': ['user_id', 'story_id']}
