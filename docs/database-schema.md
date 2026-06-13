# EchoTale Database Schema

Database: MongoDB Atlas

---

## users

```json
{
  "_id": "ObjectId",
  "name": "Nikhil Dubey",
  "email": "user@example.com",
  "password": "hashed_password",
  "avatar": "avatar_url",
  "role": "user",
  "is_premium": false,
  "favorite_genres": ["Mystery", "Romance"],
  "language": "English",
  "listening_goal": 30,
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## authors

```json
{
  "_id": "ObjectId",
  "name": "Meera Shah",
  "bio": "Story writer and narrator.",
  "avatar": "avatar_url",
  "cover_image": "cover_url",
  "genres": ["Romance", "Drama"],
  "followers_count": 1200,
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## stories

```json
{
  "_id": "ObjectId",
  "title": "The Last Letter",
  "slug": "the-last-letter",
  "author_id": "ObjectId",
  "description": "A beautiful emotional audio story.",
  "category": "Romance",
  "tags": ["love", "letter", "emotional"],
  "cover_image": "cover_url",
  "duration": 1680,
  "audio_url": "audio_url",
  "is_premium": false,
  "rating": 4.8,
  "total_reviews": 230,
  "total_listens": 12000,
  "status": "published",
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## chapters

```json
{
  "_id": "ObjectId",
  "story_id": "ObjectId",
  "title": "Chapter 1",
  "chapter_number": 1,
  "duration": 420,
  "audio_url": "chapter_audio_url",
  "created_at": "Date"
}
```

---

## listening_progress

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "story_id": "ObjectId",
  "chapter_id": "ObjectId",
  "current_time": 510,
  "duration": 1680,
  "percentage": 30,
  "completed": false,
  "last_played_at": "Date"
}
```

---

## library

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "story_id": "ObjectId",
  "status": "saved",
  "is_downloaded": false,
  "added_at": "Date"
}
```

Allowed status:

```text
saved
downloaded
completed
playlist
```

---

## bookmarks

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "story_id": "ObjectId",
  "chapter_id": "ObjectId",
  "timestamp": 450,
  "note": "Favorite line",
  "created_at": "Date"
}
```

---

## history

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "story_id": "ObjectId",
  "chapter_id": "ObjectId",
  "action": "played",
  "played_at": "Date"
}
```

---

## reviews

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "story_id": "ObjectId",
  "rating": 5,
  "comment": "Very emotional and beautiful.",
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## playlists

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "name": "My Night Stories",
  "description": "Stories for night listening.",
  "stories": ["ObjectId"],
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## subscriptions

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "plan": "premium_monthly",
  "status": "active",
  "amount": 499,
  "currency": "INR",
  "started_at": "Date",
  "expires_at": "Date",
  "payment_provider": "razorpay",
  "payment_id": "payment_id"
}
```

---

## notifications

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "New story released",
  "message": "A new story from Meera Shah is available.",
  "type": "story_release",
  "is_read": false,
  "created_at": "Date"
}
```

---

## categories

```json
{
  "_id": "ObjectId",
  "name": "Mystery",
  "slug": "mystery",
  "icon": "icon_name",
  "color": "#6C4DF6",
  "created_at": "Date"
}
```
