# EchoTale Frontend Routes

Frontend: Next.js App Router

---

## Public Routes

| Route | Page |
|---|---|
| `/` | Landing page or redirect |
| `/auth/login` | Login page |
| `/auth/signup` | Sign up page |
| `/auth/forgot-password` | Forgot password |
| `/auth/reset-password` | Reset password |

---

## Onboarding Routes

| Route | Page |
|---|---|
| `/onboarding` | User preference setup |

Onboarding steps:

1. Welcome screen
2. Select favorite genres
3. Select voice, language, and listening goals

---

## Main App Routes

| Route | Page |
|---|---|
| `/dashboard` | Home dashboard |
| `/explore` | Explore stories |
| `/explore/[category]` | Category stories |
| `/search` | Search results |
| `/stories/[storyId]` | Story detail |
| `/authors/[authorId]` | Author profile |
| `/library` | My Library |
| `/bookmarks` | Bookmarks |
| `/history` | Listening history |
| `/premium` | Premium plans |
| `/profile` | User profile |
| `/settings` | Settings |
| `/notifications` | Notifications |

---

## Dashboard Sections

Route:

```bash
/dashboard
```

Sections:

- Sidebar navigation
- Top search bar
- Hero banner
- Featured stories
- Continue listening
- Categories
- Weekly progress card
- Recommended stories
- Popular authors
- Sticky bottom audio player

---

## Explore Page

Route:

```bash
/explore
```

Sections:

- Search and filter bar
- Category chips
- Trending stories
- Mood collections
- Trending authors

---

## Search Page

Route:

```bash
/search?q=story
```

Tabs:

- Stories
- Authors
- Podcasts
- Audiobooks

---

## Story Detail Page

Route:

```bash
/stories/[storyId]
```

Sections:

- Cover image
- Story title
- Author
- Tags
- Rating
- Synopsis
- Chapter list
- Play now button
- Save button
- Similar stories
- Reviews

---

## Player Routes

The player is mostly a global component.

Components:

```bash
BottomPlayer
ExpandedPlayer
QueueDrawer
PlayerControls
ProgressBar
VolumeControl
```

Player states:

- Playing
- Paused
- Buffering
- Expanded
- Collapsed
- Queue open

---

## Library Page

Route:

```bash
/library
```

Tabs:

- All
- Downloaded
- Playlists
- Completed

---

## Bookmarks Page

Route:

```bash
/bookmarks
```

Tabs:

- Stories
- Moments
- Notes

---

## History Page

Route:

```bash
/history
```

Groups:

- Today
- Yesterday
- This week
- Earlier

---

## Premium Page

Route:

```bash
/premium
```

Sections:

- Premium hero
- Monthly/yearly toggle
- Plan cards
- Feature comparison
- FAQ
- Payment success state

---

## Profile Page

Route:

```bash
/profile
```

Sections:

- Avatar
- Display name
- Listening stats
- Favorite genres
- Achievements
- Edit profile

---

## Settings Page

Route:

```bash
/settings
```

Groups:

- Account
- Audio preferences
- Notifications
- Privacy
- Billing
- Accessibility

---

## Notifications Page

Route:

```bash
/notifications
```

Tabs:

- All
- Unread
- Story releases
- Reminders
- Account events
