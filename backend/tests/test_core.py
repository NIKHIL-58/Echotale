import os
import unittest
from types import SimpleNamespace

os.environ["MONGODB_URI"] = ""
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from django.test import override_settings
from django.urls import resolve

from apps.accounts.serializers import ProfileUpdateSerializer
from apps.stories.serializers import story_to_dict
from apps.subscriptions.views import verify_payment
from common.permissions import can_manage_story, is_admin


class PermissionTests(unittest.TestCase):
    def request(self, role="user", user_id="user-1"):
        doc = SimpleNamespace(role=role, is_premium=False)
        user = SimpleNamespace(id=user_id, doc=doc, is_authenticated=True)
        return SimpleNamespace(user=user)

    def test_owner_can_manage_story(self):
        self.assertTrue(
            can_manage_story(self.request(), SimpleNamespace(uploaded_by="user-1"))
        )

    def test_non_owner_cannot_manage_story(self):
        self.assertFalse(
            can_manage_story(self.request(), SimpleNamespace(uploaded_by="user-2"))
        )

    def test_admin_can_manage_any_story(self):
        request = self.request(role="admin")
        story = SimpleNamespace(uploaded_by="user-2")
        self.assertTrue(is_admin(request))
        self.assertTrue(can_manage_story(request, story))


class StorySerializationTests(unittest.TestCase):
    def story(self, premium=True):
        return SimpleNamespace(
            id="story-1",
            title="Test Story",
            slug="test-story",
            author="Author",
            description="Description",
            category="Book",
            tags=[],
            cover_image="/cover.jpg",
            audio_url="/audio.mp3",
            book_url="/book.pdf",
            audio_parts=[],
            duration=5,
            rating=4,
            total_reviews=1,
            total_listens=2,
            uploaded_by="owner-1",
            is_premium=premium,
            status="published",
            audio_status="generated",
            audio_error="",
            voice="alloy",
            created_at=None,
        )

    def test_premium_media_is_redacted_for_anonymous_user(self):
        result = story_to_dict(self.story(), user=None)
        self.assertEqual(result["audio_url"], "")
        self.assertEqual(result["book_url"], "")

    def test_premium_media_is_visible_to_premium_user(self):
        user = SimpleNamespace(
            id="user-1",
            is_authenticated=True,
            doc=SimpleNamespace(is_premium=True, role="user"),
        )
        result = story_to_dict(self.story(), user=user)
        self.assertEqual(result["audio_url"], "/audio.mp3")
        self.assertEqual(result["book_url"], "/book.pdf")

    def test_free_media_remains_public(self):
        result = story_to_dict(self.story(premium=False), user=None)
        self.assertEqual(result["audio_url"], "/audio.mp3")


class PaymentTests(unittest.TestCase):
    plan = {"id": "premium_monthly", "amount": 499, "currency": "INR"}

    @override_settings(DEBUG=True)
    def test_local_development_payment(self):
        self.assertTrue(verify_payment("dev_local", self.plan))

    @override_settings(
        DEBUG=False,
        PAYMENT_VERIFICATION_URL="",
        PAYMENT_VERIFICATION_SECRET="",
    )
    def test_production_rejects_unverified_payment(self):
        self.assertFalse(verify_payment("unverified", self.plan))


class ValidationAndRoutingTests(unittest.TestCase):
    def test_listening_goal_is_bounded(self):
        serializer = ProfileUpdateSerializer(data={"listening_goal": 0})
        self.assertFalse(serializer.is_valid())
        serializer = ProfileUpdateSerializer(data={"listening_goal": 30})
        self.assertTrue(serializer.is_valid())

    def test_story_review_route_exists(self):
        match = resolve("/api/reviews/stories/507f1f77bcf86cd799439011/")
        self.assertEqual(match.func.__name__, "view")

    def test_story_chapter_route_exists(self):
        match = resolve("/api/audio/stories/507f1f77bcf86cd799439011/chapters/")
        self.assertEqual(match.func.__name__, "view")


if __name__ == "__main__":
    unittest.main()
