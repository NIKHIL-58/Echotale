import mimetypes
import os
import re
from datetime import datetime

from supabase import create_client


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "echotale-media")


def get_supabase_client():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Supabase storage environment variables are missing.")

    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def clean_storage_name(name):
    safe = name.replace(" ", "_")
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "_", safe)
    return safe


def upload_django_file(file_obj, folder):
    client = get_supabase_client()

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_name = clean_storage_name(file_obj.name)
    storage_path = f"{folder}/{timestamp}_{safe_name}"

    content_type = (
        getattr(file_obj, "content_type", None)
        or mimetypes.guess_type(file_obj.name)[0]
        or "application/octet-stream"
    )

    file_obj.seek(0)
    file_bytes = file_obj.read()

    client.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
        storage_path,
        file_bytes,
        {
            "content-type": content_type,
            "upsert": "true",
        },
    )

    return client.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(storage_path)


def upload_bytes(file_bytes, folder, filename, content_type="application/octet-stream"):
    client = get_supabase_client()

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_name = clean_storage_name(filename)
    storage_path = f"{folder}/{timestamp}_{safe_name}"

    client.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
        storage_path,
        file_bytes,
        {
            "content-type": content_type,
            "upsert": "true",
        },
    )

    return client.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(storage_path)


def upload_local_file(local_path, folder, filename=None, content_type=None):
    final_name = filename or os.path.basename(local_path)
    final_content_type = (
        content_type
        or mimetypes.guess_type(final_name)[0]
        or "application/octet-stream"
    )

    with open(local_path, "rb") as file:
        file_bytes = file.read()

    return upload_bytes(
        file_bytes=file_bytes,
        folder=folder,
        filename=final_name,
        content_type=final_content_type,
    )