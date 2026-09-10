from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.daily_game import DailyGame
from app.models.game_session import GameSession
from app.models.user import User
from app.schemas.stats import (
    GuessDistributionResponse,
    ScoreHistoryItem,
    StatsResponse,
)


router = APIRouter()

IST = ZoneInfo("Asia/Kolkata")


@router.get("/me", response_model=StatsResponse)
def my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    completed_sessions = (
        db.query(GameSession)
        .filter(
            GameSession.user_id == current_user.id,
            GameSession.status.in_(["WON", "LOST"]),
            GameSession.stats_eligible.is_(True),
        )
        .all()
    )

    games_played = len(completed_sessions)

    games_won = sum(
        1
        for session in completed_sessions
        if session.status == "WON"
    )

    total_score = sum(
        session.score
        for session in completed_sessions
    )

    if games_played:
        average_guesses = round(
            sum(
                session.attempts_used
                for session in completed_sessions
            ) / games_played,
            2,
        )
    else:
        average_guesses = 0.0

    win_rate = round(
        (games_won / games_played) * 100,
        2,
    ) if games_played else 0.0

    won_sessions = (
        db.query(GameSession)
        .join(DailyGame)
        .filter(
            GameSession.user_id == current_user.id,
            GameSession.status == "WON",
            GameSession.stats_eligible.is_(True),
        )
        .all()
    )

    winning_dates = {
        session.daily_game.game_date
        for session in won_sessions
    }

    current_streak = calculate_current_streak(winning_dates)
    best_streak = calculate_best_streak(winning_dates)

    return StatsResponse(
        games_played=games_played,
        games_won=games_won,
        total_score=total_score,
        average_guesses=average_guesses,
        current_streak=current_streak,
        best_streak=best_streak,
        win_rate=win_rate,
    )


@router.get("/history", response_model=list[ScoreHistoryItem])
def stats_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(GameSession)
        .join(DailyGame)
        .filter(
            GameSession.user_id == current_user.id,
            GameSession.status.in_(["WON", "LOST"]),
            GameSession.stats_eligible.is_(True),
        )
        .order_by(DailyGame.game_date.asc())
        .all()
    )

    return [
        ScoreHistoryItem(
            game_date=session.daily_game.game_date,
            score=session.score,
            status=session.status,
            attempts=session.attempts_used,
        )
        for session in sessions
    ]


@router.get(
    "/guess-distribution",
    response_model=GuessDistributionResponse,
)
def guess_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    won_sessions = (
        db.query(GameSession)
        .filter(
            GameSession.user_id == current_user.id,
            GameSession.status == "WON",
            GameSession.stats_eligible.is_(True),
        )
        .all()
    )

    distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    }

    for session in won_sessions:
        if 1 <= session.attempts_used <= 5:
            distribution[session.attempts_used] += 1

    return GuessDistributionResponse(
        one_guess=distribution[1],
        two_guesses=distribution[2],
        three_guesses=distribution[3],
        four_guesses=distribution[4],
        five_guesses=distribution[5],
    )


def calculate_current_streak(winning_dates) -> int:
    if not winning_dates:
        return 0

    today = datetime.now(IST).date()

    if today not in winning_dates:
        return 0

    streak = 0
    current_date = today

    while current_date in winning_dates:
        streak += 1
        current_date -= timedelta(days=1)

    return streak


def calculate_best_streak(winning_dates) -> int:
    if not winning_dates:
        return 0

    sorted_dates = sorted(winning_dates)

    best = 1
    current = 1

    for index in range(1, len(sorted_dates)):
        difference = (
            sorted_dates[index]
            - sorted_dates[index - 1]
        )

        if difference == timedelta(days=1):
            current += 1
        else:
            current = 1

        best = max(best, current)

    return best