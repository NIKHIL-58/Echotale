from datetime import datetime
from mongoengine import Document, StringField, ListField, IntField, DateTimeField

class AuthorDocument(Document):
    name = StringField(required=True, max_length=120)
    bio = StringField(default='')
    avatar = StringField(default='')
    cover_image = StringField(default='')
    genres = ListField(StringField(), default=[])
    followers_count = IntField(default=0)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'authors', 'indexes': ['name']}
