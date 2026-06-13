from datetime import datetime
from mongoengine import Document, StringField, ListField, FloatField, IntField, BooleanField, DateTimeField

class StoryDocument(Document):
    title = StringField(required=True, max_length=180)
    slug = StringField(required=True, unique=True)
    author_id = StringField(required=True)
    description = StringField(default='')
    category = StringField(default='Adventure')
    tags = ListField(StringField(), default=[])
    cover_image = StringField(default='')
    duration = IntField(default=0)
    audio_url = StringField(default='')
    is_premium = BooleanField(default=False)
    rating = FloatField(default=0)
    total_reviews = IntField(default=0)
    total_listens = IntField(default=0)
    status = StringField(default='published')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'stories', 'indexes': ['title', 'slug', 'category', 'author_id']}

class CategoryDocument(Document):
    name = StringField(required=True, unique=True)
    slug = StringField(required=True, unique=True)
    icon = StringField(default='book')
    color = StringField(default='#6C4DF6')
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'categories'}
