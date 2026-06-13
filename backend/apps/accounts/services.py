from datetime import datetime, timezone
import jwt
from django.conf import settings
from apps.accounts.models import UserDocument


def create_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'iat': now,
        'exp': now + settings.JWT_ACCESS_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def create_user(name, email, password):
    if UserDocument.objects(email=email.lower()).first():
        raise ValueError('Email already exists')
    user = UserDocument(name=name, email=email.lower())
    user.set_password(password)
    user.save()
    return user
