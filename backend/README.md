# EchoTale Backend

Django REST API for the EchoTale audio storytelling app using MongoDB Atlas through MongoEngine.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

## Important

Update `.env` with your MongoDB Atlas URI. Do not push `.env` to GitHub.

## Health Check

```http
GET http://127.0.0.1:8000/api/health/
```
