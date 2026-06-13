from datetime import datetime
from mongoengine import Document, StringField, IntField, DateTimeField
class SubscriptionDocument(Document):
    user_id = StringField(required=True)
    plan = StringField(default='premium_monthly')
    status = StringField(default='active')
    amount = IntField(default=499)
    currency = StringField(default='INR')
    started_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField()
    payment_provider = StringField(default='razorpay')
    payment_id = StringField(default='')
    meta = {'collection': 'subscriptions', 'indexes': ['user_id']}
