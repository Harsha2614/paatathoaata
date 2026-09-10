from pydantic import BaseModel, Field


class RevealedClip(BaseModel):
    chunk_number: int
    audio_url: str


class AttemptResponse(BaseModel):
    attempt_number: int
    guess: str
    is_correct: bool
    score_earned: int = 0


class GameResponse(BaseModel):
    game_session_id: int
    chunk_number: int
    audio_url: str

    revealed_clips: list[RevealedClip]

    attempts_used: int
    attempts_remaining: int
    status: str

    # Current total score
    total_score: int = 0

    # Only returned after the game is completed
    answer: str | None = None

    # Actual game date
    game_date: str | None = None

    # True when playing through Time Machine
    is_time_machine: bool = False

    # All guesses/attempts already made in this game
    attempts: list[AttemptResponse] = Field(
        default_factory=list
    )


class GuessRequest(BaseModel):
    game_session_id: int
    guess: str


class GuessResponse(BaseModel):
    correct: bool

    # Points earned for this particular guess
    score_earned: int

    # Total score accumulated in this game
    total_score: int

    attempts_used: int

    status: str

    # Returned when another clue should be revealed
    next_chunk_number: int | None = None
    next_audio_url: str | None = None

    # Returned when the game is completed
    answer: str | None = None

    # All clips revealed so far
    revealed_clips: list[RevealedClip] = Field(
        default_factory=list
    )