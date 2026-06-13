from datetime import datetime
from mongoengine import Document, StringField, DateTimeField
class HistoryDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    chapter_id = StringField(default='')
    action = StringField(default='played')
    played_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'history', 'indexes': ['user_id', 'played_at']}
