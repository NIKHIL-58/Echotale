from datetime import datetime
from mongoengine import Document, StringField, IntField, DateTimeField
class ReviewDocument(Document):
    user_id = StringField(required=True)
    story_id = StringField(required=True)
    rating = IntField(min_value=1, max_value=5)
    comment = StringField(default='')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'reviews', 'indexes': ['story_id', 'user_id']}
