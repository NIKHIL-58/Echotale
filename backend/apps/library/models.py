from datetime import datetime
from mongoengine import Document, StringField, BooleanField, DateTimeField

class LibraryDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    status = StringField(default='saved')
    is_downloaded = BooleanField(default=False)
    added_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'library', 'indexes': ['user_id', 'story_id']}
