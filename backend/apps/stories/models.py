from datetime import datetime
from mongoengine import (
    Document,
    EmbeddedDocument,
    StringField,
    IntField,
    FloatField,
    BooleanField,
    ListField,
    DateTimeField,
    EmbeddedDocumentListField,
)


class AudioPartDocument(EmbeddedDocument):
    part_number = IntField(required=True)
    title = StringField(default="")
    audio_url = StringField(default="")
    text_preview = StringField(default="")
    duration_estimate = IntField(default=5)
    created_at = DateTimeField(default=datetime.utcnow)


class StoryDocument(Document):
    title = StringField(required=True, max_length=200)
    slug = StringField(required=True, unique=True)

    author = StringField(default="Unknown Author", max_length=120)
    description = StringField(default="")
    category = StringField(default="Book")
    tags = ListField(StringField(), default=[])

    cover_image = StringField(default="")
    audio_url = StringField(default="")
    book_url = StringField(default="")

    audio_parts = EmbeddedDocumentListField(AudioPartDocument, default=[])

    duration = IntField(default=0)
    rating = FloatField(default=0)
    total_reviews = IntField(default=0)
    total_listens = IntField(default=0)

    uploaded_by = StringField(default="")
    is_premium = BooleanField(default=False)
    status = StringField(default="published")

    audio_status = StringField(default="not_generated")
    audio_error = StringField(default="")

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "stories",
        "indexes": ["slug", "category", "title", "author"],
    }