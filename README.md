# EchoTale

EchoTale is an audio storytelling platform built with:

- Backend: Django + Django REST Framework
- Database: MongoDB Atlas
- Frontend: Next.js + TypeScript
- UI: EchoTale Figma dashboard design
- Features: stories, audiobooks, podcasts, authors, player, library, bookmarks, history, premium plans, and notifications

---

## Project Structure

```bash
Echotale_Project/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── config/
│   ├── apps/
│   ├── common/
│   ├── media/
│   └── static/
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── .env.local
│   ├── public/
│   └── src/
│
├── docs/
│   ├── api-endpoints.md
│   ├── database-schema.md
│   ├── frontend-routes.md
│   └── setup-guide.md
│
├── docker-compose.yml
└── README.md
```

---

## Main Features

- User authentication
- Story discovery
- Search stories, authors, podcasts, and audiobooks
- Story detail page
- Audio player
- Continue listening
- Bookmarks
- Listening history
- My Library
- Author profiles
- Reviews and ratings
- Premium subscription
- Notifications
- Profile and settings

---

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

Backend will run on:

```bash
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:3000
```

---

## Environment Variables

Backend `.env`

```env
SECRET_KEY=your_secret_key
DEBUG=True
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET_KEY=your_jwt_secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## Git Commands

```bash
git init
git add .
git commit -m "Initial EchoTale project setup"
git branch -M main
git remote add origin https://github.com/NIKHIL-58/Echotale.git
git push -u origin main
```
