from datetime import datetime
from mongoengine import Document, StringField, BooleanField, DateTimeField
class NotificationDocument(Document):
    user_id = StringField(required=True)
    title = StringField(required=True)
    message = StringField(default='')
    type = StringField(default='info')
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    meta = {'collection': 'notifications', 'indexes': ['user_id', 'is_read']}
