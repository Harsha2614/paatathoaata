from datetime import date

from pydantic import BaseModel, Field


class ClipRequest(BaseModel):
    chunk_number: int = Field(ge=1, le=5)
    audio_url: str = Field(min_length=1, max_length=1000)


class CreateSongRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    movie_name: str = Field(min_length=1, max_length=255)
    clips: list[ClipRequest] = Field(min_length=5, max_length=5)


class SongResponse(BaseModel):
    id: int
    title: str
    movie_name: str
    clip_count: int


class ScheduleGameRequest(BaseModel):
    song_id: int
    game_date: date


class DailyGameResponse(BaseModel):
    id: int
    song_id: int
    game_date: date