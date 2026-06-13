# EchoTale API Endpoints

Base URL:

```bash
http://127.0.0.1:8000/api
```

---

## Authentication

### Register User

```http
POST /auth/register/
```

Body:

```json
{
  "name": "Nikhil Dubey",
  "email": "user@example.com",
  "password": "password123"
}
```

### Login User

```http
POST /auth/login/
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User

```http
GET /auth/me/
```

Headers:

```http
Authorization: Bearer <token>
```

### Logout

```http
POST /auth/logout/
```

---

## Stories

### Get All Stories

```http
GET /stories/
```

Query examples:

```http
GET /stories/?category=Mystery
GET /stories/?search=dark
GET /stories/?sort=popular
```

### Get Story Detail

```http
GET /stories/:storyId/
```

### Create Story

```http
POST /stories/
```

Body:

```json
{
  "title": "The Last Letter",
  "author_id": "author_id",
  "description": "A touching emotional story.",
  "category": "Romance",
  "duration": 28,
  "cover_image": "cover_url",
  "audio_url": "audio_url"
}
```

### Update Story

```http
PUT /stories/:storyId/
```

### Delete Story

```http
DELETE /stories/:storyId/
```

---

## Authors

### Get All Authors

```http
GET /authors/
```

### Get Author Detail

```http
GET /authors/:authorId/
```

### Get Stories By Author

```http
GET /authors/:authorId/stories/
```

---

## Audio Player

### Get Story Chapters

```http
GET /stories/:storyId/chapters/
```

### Save Listening Progress

```http
POST /audio/progress/
```

Body:

```json
{
  "story_id": "story_id",
  "chapter_id": "chapter_id",
  "current_time": 510,
  "duration": 1680,
  "percentage": 30
}
```

### Get Continue Listening

```http
GET /audio/continue-listening/
```

---

## Library

### Get My Library

```http
GET /library/
```

### Add Story To Library

```http
POST /library/
```

Body:

```json
{
  "story_id": "story_id"
}
```

### Remove Story From Library

```http
DELETE /library/:storyId/
```

---

## Bookmarks

### Get Bookmarks

```http
GET /bookmarks/
```

### Add Bookmark

```http
POST /bookmarks/
```

Body:

```json
{
  "story_id": "story_id",
  "chapter_id": "chapter_id",
  "timestamp": 450,
  "note": "Important moment"
}
```

### Delete Bookmark

```http
DELETE /bookmarks/:bookmarkId/
```

---

## History

### Get Listening History

```http
GET /history/
```

### Clear History

```http
DELETE /history/
```

---

## Reviews

### Get Story Reviews

```http
GET /stories/:storyId/reviews/
```

### Add Review

```http
POST /stories/:storyId/reviews/
```

Body:

```json
{
  "rating": 5,
  "comment": "Amazing story"
}
```

---

## Recommendations

### Get Recommended Stories

```http
GET /recommendations/
```

### Get Trending Stories

```http
GET /recommendations/trending/
```

---

## Subscriptions

### Get Plans

```http
GET /subscriptions/plans/
```

### Subscribe To Plan

```http
POST /subscriptions/subscribe/
```

Body:

```json
{
  "plan_id": "premium_monthly"
}
```

### Get Current Subscription

```http
GET /subscriptions/current/
```

---

## Notifications

### Get Notifications

```http
GET /notifications/
```

### Mark Notification As Read

```http
PATCH /notifications/:notificationId/read/
```

---

## Profile

### Get Profile

```http
GET /profile/
```

### Update Profile

```http
PUT /profile/
```

Body:

```json
{
  "name": "Nikhil Dubey",
  "language": "English",
  "favorite_genres": ["Mystery", "Romance", "Sci-Fi"]
}
```
