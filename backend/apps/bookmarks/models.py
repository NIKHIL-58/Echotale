from datetime import datetime
from mongoengine import Document, StringField, IntField, DateTimeField
class BookmarkDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    chapter_id = StringField(default='')
    timestamp = IntField(default=0)
    note = StringField(default='')
    created_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'bookmarks', 'indexes': ['user_id', 'story_id']}
