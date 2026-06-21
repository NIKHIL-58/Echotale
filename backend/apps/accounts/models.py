from datetime import datetime
import bcrypt
from mongoengine import (
    Document,
    StringField,
    BooleanField,
    ListField,
    IntField,
    DateTimeField,
    EmailField,
)


class UserDocument(Document):
    name = StringField(required=True, max_length=120)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)

    avatar = StringField(default="")
    role = StringField(default="user")
    is_premium = BooleanField(default=False)
    favorite_genres = ListField(StringField(), default=[])
    language = StringField(default="English")
    listening_goal = IntField(default=30)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "users",
        "indexes": ["email"],
    }

    def set_password(self, raw_password):
        self.password = bcrypt.hashpw(
            raw_password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

    def is_password_hashed(self):
        return self.password.startswith("$2a$") or self.password.startswith("$2b$") or self.password.startswith("$2y$")

    def check_password(self, raw_password):
        if not self.password:
            return False

        if not self.is_password_hashed():
            return self.password == raw_password

        try:
            return bcrypt.checkpw(
                raw_password.encode("utf-8"),
                self.password.encode("utf-8"),
            )
        except Exception:
            return False