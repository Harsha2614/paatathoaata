from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
from fastapi import File, Form, UploadFile
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.daily_game import DailyGame
from app.models.song import Song
from app.models.song_clip import SongClip
from app.models.user import User

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.song import Song
from app.models.song_clip import SongClip
from app.models.user import User

from app.schemas.admin import (
    CreateSongRequest,
    DailyGameResponse,
    ScheduleGameRequest,
    SongResponse,
)

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/x-mpeg",
}
ALLOWED_EXTENSIONS = {
    ".mp3",
    ".mpeg",
    ".mpg",
    ".wav",
    ".ogg",
    ".m4a",
}

@router.get("/health")
def admin_health(
    current_admin: User = Depends(get_current_admin),
):
    return {
        "message": "Admin API is working",
        "admin": current_admin.username,
    }


@router.post("/songs", response_model=SongResponse, status_code=201)
def create_song(
    payload: CreateSongRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    # Require exactly chunks 1, 2, 3, 4, 5.
    chunk_numbers = [clip.chunk_number for clip in payload.clips]

    if sorted(chunk_numbers) != [1, 2, 3, 4, 5]:
        raise HTTPException(
            status_code=400,
            detail="Exactly five chunks numbered 1, 2, 3, 4, and 5 are required",
        )

    song = Song(
        title=payload.title.strip(),
        movie_name=payload.movie_name.strip(),
    )

    db.add(song)
    db.flush()

    for clip in payload.clips:
        song_clip = SongClip(
            song_id=song.id,
            chunk_number=clip.chunk_number,
            audio_url=clip.audio_url.strip(),
        )
        db.add(song_clip)

    try:
        db.commit()
        db.refresh(song)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not create song",
        )

    return SongResponse(
        id=song.id,
        title=song.title,
        movie_name=song.movie_name,
        clip_count=5,
    )


@router.post(
    "/daily-games",
    response_model=DailyGameResponse,
    status_code=201,
)
def schedule_daily_game(
    payload: ScheduleGameRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    song = db.get(Song, payload.song_id)

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Song not found",
        )

    # Verify the song has exactly five clips.
    clips = (
        db.query(SongClip)
        .filter(SongClip.song_id == song.id)
        .all()
    )

    chunk_numbers = sorted(clip.chunk_number for clip in clips)

    if chunk_numbers != [1, 2, 3, 4, 5]:
        raise HTTPException(
            status_code=400,
            detail="Song must have exactly five valid chunks before scheduling",
        )

    # Only one game can exist for a date.
    existing_game = (
        db.query(DailyGame)
        .filter(DailyGame.game_date == payload.game_date)
        .first()
    )

    if existing_game:
        raise HTTPException(
            status_code=409,
            detail="A daily game already exists for this date",
        )

    daily_game = DailyGame(
        song_id=song.id,
        game_date=payload.game_date,
    )

    db.add(daily_game)

    try:
        db.commit()
        db.refresh(daily_game)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A daily game already exists for this date",
        )

    return DailyGameResponse(
        id=daily_game.id,
        song_id=daily_game.song_id,
        game_date=daily_game.game_date,
    )
@router.post("/songs/upload")
async def create_song_with_audio(
    title: str = Form(...),
    movie_name: str = Form(...),
    chunk_1: UploadFile = File(...),
    chunk_2: UploadFile = File(...),
    chunk_3: UploadFile = File(...),
    chunk_4: UploadFile = File(...),
    chunk_5: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Create a song and upload exactly 5 audio chunks.
    """

    files = [
        (1, chunk_1),
        (2, chunk_2),
        (3, chunk_3),
        (4, chunk_4),
        (5, chunk_5),
    ]

    for chunk_number, upload in files:
        extension = Path(upload.filename or "").suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Chunk {chunk_number} has an unsupported "
                    f"file type. Use MP3, MPEG, WAV, OGG, or M4A."
                ),
            )

        if upload.content_type not in ALLOWED_AUDIO_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Chunk {chunk_number} is not a valid audio file.",
            )

    song = Song(
        title=title.strip(),
        movie_name=movie_name.strip(),
    )

    db.add(song)
    db.flush()

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    for chunk_number, upload in files:
        extension = Path(upload.filename).suffix.lower()

        filename = (
            f"song_{song.id}_"
            f"chunk_{chunk_number}_"
            f"{uuid.uuid4().hex}"
            f"{extension}"
        )

        file_path = UPLOAD_DIR / filename

        contents = await upload.read()

        file_path.write_bytes(contents)

        audio_url = f"/uploads/{filename}"

        clip = SongClip(
            song_id=song.id,
            chunk_number=chunk_number,
            audio_url=audio_url,
        )

        db.add(clip)

    db.commit()
    db.refresh(song)

    return {
        "id": song.id,
        "title": song.title,
        "movie_name": song.movie_name,
        "clip_count": 5,
    }