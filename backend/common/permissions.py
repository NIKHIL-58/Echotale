from rest_framework.permissions import BasePermission


def is_authenticated(request):
    user = getattr(request, "user", None)
    return bool(user and getattr(user, "is_authenticated", False))


def is_admin(request):
    if not is_authenticated(request):
        return False
    user_doc = getattr(request.user, "doc", None)
    return bool(user_doc and getattr(user_doc, "role", "user") == "admin")


def can_manage_story(request, story):
    if not is_authenticated(request):
        return False
    return is_admin(request) or story.uploaded_by == str(request.user.id)


class IsAdminRole(BasePermission):
    message = "Administrator access is required."

    def has_permission(self, request, view):
        return is_admin(request)
