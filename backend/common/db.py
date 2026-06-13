from django.conf import settings
from mongoengine import connect

_connection = None

def connect_mongodb():
    global _connection
    if _connection is None and settings.MONGODB_URI:
        _connection = connect(host=settings.MONGODB_URI, alias='default')
    return _connection
