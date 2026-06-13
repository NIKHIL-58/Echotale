import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from apps.accounts.models import UserDocument

class SimpleUser:
    def __init__(self, user_doc):
        self.doc = user_doc
        self.id = str(user_doc.id)
        self.email = user_doc.email
        self.name = user_doc.name
        self.is_authenticated = True

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = UserDocument.objects(id=payload.get('user_id')).first()
            if not user:
                raise AuthenticationFailed('User not found')
            return (SimpleUser(user), token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
