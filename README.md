# Datastraw Customer Support Ticket CRM System

A full-stack, production-ready Customer Support Ticket Management CRM system built for **Datastraw Technologies Assessment Test**.

![Datastraw CRM Banner](https://img.shields.io/badge/Datastraw-Assessment_Test-6366f1?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🌟 Key Features

1. **Create Tickets**: Instant ticket submission with customer details (name, email), issue subject, priority tag, description, auto-generated ticket ID (`TKT-1001`), and timestamp.
2. **List All Tickets**: Clean table displaying Ticket ID, Customer Name & Email, Subject, Priority Badge, Status Badge (`Open`, `In Progress`, `Closed`), and Creation Date.
3. **Real-time Search**: Search as you type across customer names, ticket IDs, emails, subjects, and descriptions.
4. **Filter by Status**: Interactive tab filter (`All`, `Open`, `In Progress`, `Closed`).
5. **Detailed View & Status Update**: Detailed modal view for each ticket allowing support agents to update status, change priority, and add internal notes/comments with a timestamped activity timeline.
6. **Analytics Stats Bar**: Quick summary metrics showing Total, Open, In Progress, and Closed ticket counts.

---

## 🛠 Tech Stack

- **Backend**: Python 3, FastAPI, SQLite, SQLAlchemy ORM, Pydantic v2
- **Frontend**: React (Vite), Glassmorphism Vanilla CSS, Lucide Icons, Axios / Fetch API
- **API Standard**: RESTful architecture

---

## 🚀 Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# On Linux/macOS
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart email-validator

# Run FastAPI Server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will run at `http://127.0.0.1:8000`. Swagger API docs are available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React frontend will run at `http://127.0.0.1:5173/`.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/tickets` | Create a new support ticket |
| **GET** | `/api/tickets` | List tickets with `?status=` and `?search=` filters |
| **GET** | `/api/tickets/{ticket_id}` | Retrieve full ticket detail + activity notes |
| **PUT** | `/api/tickets/{ticket_id}` | Update ticket status/priority & append note |
| **POST** | `/api/tickets/{ticket_id}/notes` | Add an internal note/comment to a ticket |
| **GET** | `/api/stats` | Get CRM dashboard ticket count statistics |

---

## 🚢 Deployment Guide

- **Backend (FastAPI)**: Deployable to **Render** or **Railway.app** using the included `main.py` entry point.
- **Frontend (React)**: Deployable to **Vercel**, **Netlify**, or **Render Static Site**.

---

## 👨‍💻 Project Structure

```
datastraw/
├── backend/
│   ├── main.py              # FastAPI server & SQLite SQLAlchemy database logic
│   ├── test_post.py         # Backend test script
│   └── tickets.db           # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateTicketModal.jsx   # Ticket creation form
│   │   │   └── TicketDetailModal.jsx   # Detail view & notes activity log
│   │   ├── App.jsx                     # Dashboard UI, stats & table list
│   │   ├── index.css                   # Glassmorphism design system & CSS variables
│   │   └── main.jsx                    # React entrypoint
│   ├── package.json
│   └── vite.config.js
└── README.md
```
