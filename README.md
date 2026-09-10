# GuessTheSong

Telugu daily song guessing game.

## Stack
- Frontend: React + Vite
- Backend: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- Migrations: Alembic (ready to add)
- Git

## Game rules
- One Telugu song per day.
- Exactly 5 audio chunks per song.
- The player gets 5 guesses.
- A wrong guess reveals the next chunk.
- Score: 100, 80, 60, 40, 20 for correct guesses on attempts 1–5.
- Failure after 5 wrong guesses: 0 points and reveal the answer.
- Daily game is based on Asia/Kolkata (IST).

## Project structure

```text
guessthesong/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

Set your PostgreSQL connection string in `backend/.env`.
