from datetime import datetime
import jwt

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import success, error
from apps.accounts.models import UserDocument
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ProfileUpdateSerializer,
    user_to_dict,
)
from apps.accounts.services import create_password_reset_token, create_token, create_user


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    try:
        user = create_user(**serializer.validated_data)
        token = create_token(user)

        return success(
            {
                "user": user_to_dict(user),
                "token": token,
            },
            "Registered successfully",
            201,
        )

    except ValueError as exc:
        return error(str(exc), 400)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    email = serializer.validated_data["email"].lower()
    password = serializer.validated_data["password"]

    user = UserDocument.objects(email=email).first()

    if not user or not user.check_password(password):
        return error("Invalid email or password", 401)

    # If old user password was stored as plain text, upgrade it to bcrypt.
    if not user.is_password_hashed():
        user.set_password(password)
        user.updated_at = datetime.utcnow()
        user.save()

    token = create_token(user)

    return success(
        {
            "user": user_to_dict(user),
            "token": token,
        },
        "Logged in successfully",
    )


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user.doc

    if request.method == "GET":
        return success(user_to_dict(user))

    serializer = ProfileUpdateSerializer(data=request.data)

    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    for key, value in serializer.validated_data.items():
        setattr(user, key, value)

    user.updated_at = datetime.utcnow()
    user.save()

    return success(user_to_dict(user), "Profile updated")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return success(user_to_dict(request.user.doc))



@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    user = UserDocument.objects(
        email=serializer.validated_data["email"].lower()
    ).first()
    response_data = {}

    if user and settings.DEBUG:
        response_data["reset_token"] = create_password_reset_token(user)

    return success(
        response_data,
        "If that account exists, password reset instructions are available.",
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error("Validation failed", errors=serializer.errors)

    try:
        payload = jwt.decode(
            serializer.validated_data["token"],
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        return error("Reset link has expired.", 400)
    except jwt.InvalidTokenError:
        return error("Invalid reset link.", 400)

    if payload.get("type") != "password_reset":
        return error("Invalid reset link.", 400)

    user = UserDocument.objects(id=payload.get("user_id")).first()
    if not user:
        return error("Invalid reset link.", 400)

    user.set_password(serializer.validated_data["password"])
    user.updated_at = datetime.utcnow()
    user.save()
    return success(None, "Password updated successfully.")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    return success(None, "Logged out successfully")