from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user

from app.models.attempt import Attempt
from app.models.daily_game import DailyGame
from app.models.game_session import GameSession
from app.models.song_clip import SongClip
from app.models.user import User

from app.schemas.game import (
    GameResponse,
    GuessRequest,
    GuessResponse,
)


router = APIRouter()

IST = ZoneInfo("Asia/Kolkata")

MAX_ATTEMPTS = 5


def normalize(value: str) -> str:
    return " ".join(
        value.lower().strip().split()
    )


def build_audio_url(audio_url: str) -> str:
    """
    Convert a stored relative audio path into
    a complete backend URL.

    Absolute URLs are returned unchanged.
    """

    if audio_url.startswith(("http://", "https://")):
        return audio_url

    return (
        f"{settings.backend_url.rstrip('/')}/"
        f"{audio_url.lstrip('/')}"
    )


def score_for_attempt(attempt_number: int) -> int:
    scores = {
        1: 100,
        2: 80,
        3: 60,
        4: 40,
        5: 20,
    }

    return scores.get(attempt_number, 0)


def get_revealed_clips(
    db: Session,
    song_id: int,
    max_chunk: int,
):
    """
    Return all clips revealed up to max_chunk.
    """

    clips = (
        db.query(SongClip)
        .filter(
            SongClip.song_id == song_id,
            SongClip.chunk_number <= max_chunk,
        )
        .order_by(SongClip.chunk_number)
        .all()
    )

    return [
        {
            "chunk_number": clip.chunk_number,
            "audio_url": build_audio_url(
                clip.audio_url
            ),
        }
        for clip in clips
    ]


# ============================================================
# GET TODAY'S GAME
# ============================================================

@router.get(
    "/today",
    response_model=GameResponse,
)
def get_today_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.now(IST).date()

    game = (
        db.query(DailyGame)
        .filter(
            DailyGame.game_date == today
        )
        .first()
    )

    if not game:
        raise HTTPException(
            status_code=404,
            detail="Today's game is not available",
        )

    # --------------------------------------------------------
    # Find user's existing session for today's game
    # --------------------------------------------------------

    session = (
        db.query(GameSession)
        .filter(
            GameSession.user_id == current_user.id,
            GameSession.daily_game_id == game.id,
        )
        .first()
    )

    # --------------------------------------------------------
    # Create session if this is the user's first visit
    # --------------------------------------------------------

    if not session:
        session = GameSession(
            user_id=current_user.id,
            daily_game_id=game.id,
            current_chunk=1,
            attempts_used=0,
            score=0,
            status="PLAYING",
            started_at=datetime.now(timezone.utc),
        )

        db.add(session)
        db.commit()
        db.refresh(session)

    # ========================================================
    # COMPLETED GAME
    # ========================================================

    if session.status != "PLAYING":

        # Completed games reveal all five clips.
        revealed_clips = get_revealed_clips(
            db=db,
            song_id=game.song_id,
            max_chunk=5,
        )

        return GameResponse(
            game_session_id=session.id,

            chunk_number=session.current_chunk,

            audio_url=(
                revealed_clips[0]["audio_url"]
                if revealed_clips
                else ""
            ),

            revealed_clips=revealed_clips,

            attempts_used=session.attempts_used,

            attempts_remaining=0,

            status=session.status,

            # IMPORTANT:
            # Return the score stored in GameSession.
            total_score=session.score,

            # Return the answer for completed games.
            answer=game.song.movie_name,

            # Return the actual game date.
            game_date=str(game.game_date),
        )

    # ========================================================
    # ACTIVE GAME
    # ========================================================

    clip = (
        db.query(SongClip)
        .filter(
            SongClip.song_id == game.song_id,
            SongClip.chunk_number
            == session.current_chunk,
        )
        .first()
    )

    if not clip:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Missing chunk "
                f"{session.current_chunk}"
            ),
        )

    # Get all clips revealed so far.
    revealed_clips = get_revealed_clips(
        db=db,
        song_id=game.song_id,
        max_chunk=session.current_chunk,
    )

    return GameResponse(
        game_session_id=session.id,

        chunk_number=session.current_chunk,

        audio_url=build_audio_url(
            clip.audio_url
        ),

        revealed_clips=revealed_clips,

        attempts_used=session.attempts_used,

        attempts_remaining=(
            MAX_ATTEMPTS
            - session.attempts_used
        ),

        status=session.status,

        # Current score.
        total_score=session.score,

        # Current game date.
        game_date=str(game.game_date),

        # Do not reveal answer while playing.
        answer=None,
    )


# ============================================================
# SUBMIT GUESS
# ============================================================

@router.post(
    "/guess",
    response_model=GuessResponse,
)
def guess(
    payload: GuessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.get(
        GameSession,
        payload.game_session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Game session not found",
        )

    # --------------------------------------------------------
    # Security check
    # --------------------------------------------------------

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "this game session"
            ),
        )

    # --------------------------------------------------------
    # Game already completed
    # --------------------------------------------------------

    if session.status != "PLAYING":
        raise HTTPException(
            status_code=400,
            detail="Game is already completed",
        )

    # --------------------------------------------------------
    # No attempts remaining
    # --------------------------------------------------------

    if session.attempts_used >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=400,
            detail="No attempts remaining",
        )

    # ========================================================
    # CREATE ATTEMPT
    # ========================================================

    attempt_number = (
        session.attempts_used + 1
    )

    session.attempts_used = attempt_number

    answer = normalize(
        session.daily_game.song.movie_name
    )

    user_guess = normalize(
        payload.guess
    )

    is_correct = (
        user_guess == answer
    )

    earned = (
        score_for_attempt(attempt_number)
        if is_correct
        else 0
    )

    attempt = Attempt(
        game_session_id=session.id,
        attempt_number=attempt_number,
        guess=payload.guess.strip(),
        is_correct=is_correct,
        score_earned=earned,
        created_at=datetime.now(timezone.utc),
    )

    db.add(attempt)

    # ========================================================
    # CORRECT ANSWER
    # ========================================================

    if is_correct:

        session.score += earned

        session.status = "WON"

        session.completed_at = (
            datetime.now(timezone.utc)
        )

        db.commit()

        # Reveal all five clips.
        revealed_clips = get_revealed_clips(
            db=db,
            song_id=session.daily_game.song_id,
            max_chunk=5,
        )

        return GuessResponse(
            correct=True,

            score_earned=earned,

            total_score=session.score,

            attempts_used=attempt_number,

            status="WON",

            answer=(
                session.daily_game.song.movie_name
            ),

            revealed_clips=revealed_clips,
        )

    # ========================================================
    # FIFTH INCORRECT ATTEMPT
    # ========================================================

    if attempt_number == MAX_ATTEMPTS:

        session.status = "LOST"

        session.completed_at = (
            datetime.now(timezone.utc)
        )

        db.commit()

        # Reveal all five clips.
        revealed_clips = get_revealed_clips(
            db=db,
            song_id=session.daily_game.song_id,
            max_chunk=5,
        )

        return GuessResponse(
            correct=False,

            score_earned=0,

            total_score=session.score,

            attempts_used=attempt_number,

            status="LOST",

            answer=(
                session.daily_game.song.movie_name
            ),

            revealed_clips=revealed_clips,
        )

    # ========================================================
    # WRONG GUESS
    # REVEAL NEXT CLIP
    # ========================================================

    next_chunk = attempt_number + 1

    clip = (
        db.query(SongClip)
        .filter(
            SongClip.song_id
            == session.daily_game.song_id,

            SongClip.chunk_number
            == next_chunk,
        )
        .first()
    )

    if not clip:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Missing chunk "
                f"{next_chunk}"
            ),
        )

    session.current_chunk = next_chunk

    db.commit()

    # Return every clip revealed so far.
    revealed_clips = get_revealed_clips(
        db=db,
        song_id=session.daily_game.song_id,
        max_chunk=next_chunk,
    )

    return GuessResponse(
        correct=False,

        score_earned=0,

        total_score=session.score,

        attempts_used=attempt_number,

        status="PLAYING",

        next_chunk_number=next_chunk,

        next_audio_url=build_audio_url(
            clip.audio_url
        ),

        revealed_clips=revealed_clips,
    )