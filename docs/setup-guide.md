# EchoTale Setup Guide

This guide explains how to run EchoTale locally.

---

## Requirements

Install these first:

- Python 3.11+
- Node.js 18+
- Git
- MongoDB Atlas account
- VS Code

---

## 1. Clone Project

```bash
git clone https://github.com/NIKHIL-58/Echotale.git
cd Echotale
```

---

## 2. Backend Setup

Go to backend folder:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Create `.env` file:

```env
SECRET_KEY=your_secret_key
DEBUG=True
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/echotale
JWT_SECRET_KEY=your_jwt_secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Run backend:

```bash
python manage.py runserver
```

Backend URL:

```bash
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

Open a new terminal.

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Run frontend:

```bash
npm run dev
```

Frontend URL:

```bash
http://localhost:3000
```

---

## 4. MongoDB Atlas Setup

1. Open MongoDB Atlas.
2. Create a new project.
3. Create a free cluster.
4. Create a database user.
5. Add your IP address in Network Access.
6. Copy connection string.
7. Paste it in backend `.env`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/echotale
```

---

## 5. GitHub Push

Run from root folder:

```bash
git init
git add .
git commit -m "Initial EchoTale project setup"
git branch -M main
git remote add origin https://github.com/NIKHIL-58/Echotale.git
git push -u origin main
```

---

## 6. Docker Setup

Run:

```bash
docker-compose up --build
```

Backend:

```bash
http://localhost:8000
```

Frontend:

```bash
http://localhost:3000
```

---

## 7. Recommended VS Code Extensions

- Python
- Django
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens

---

## 8. Development Flow

Backend terminal:

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Frontend terminal:

```bash
cd frontend
npm run dev
```

---

## 9. Common Git Commands

Check status:

```bash
git status
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Your message"
```

Push:

```bash
git push
```

Pull latest code:

```bash
git pull
```
