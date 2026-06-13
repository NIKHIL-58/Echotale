from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success, error
from apps.accounts.models import UserDocument
from apps.accounts.serializers import RegisterSerializer, LoginSerializer, ProfileUpdateSerializer, user_to_dict
from apps.accounts.services import create_token, create_user

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    try:
        user = create_user(**serializer.validated_data)
        token = create_token(user)
        return success({'user': user_to_dict(user), 'token': token}, 'Registered successfully', 201)
    except ValueError as exc:
        return error(str(exc), 400)

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    user = UserDocument.objects(email=serializer.validated_data['email'].lower()).first()
    if not user or not user.check_password(serializer.validated_data['password']):
        return error('Invalid email or password', 401)
    token = create_token(user)
    return success({'user': user_to_dict(user), 'token': token}, 'Logged in successfully')

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user.doc
    if request.method == 'GET':
        return success(user_to_dict(user))
    serializer = ProfileUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)
    for key, value in serializer.validated_data.items():
        setattr(user, key, value)
    user.updated_at = datetime.utcnow()
    user.save()
    return success(user_to_dict(user), 'Profile updated')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return success(user_to_dict(request.user.doc))

@api_view(['POST'])
def logout(request):
    return success(None, 'Logged out successfully')
