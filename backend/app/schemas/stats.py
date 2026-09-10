from datetime import date

from pydantic import BaseModel


class StatsResponse(BaseModel):
    games_played: int
    games_won: int
    total_score: int
    average_guesses: float
    current_streak: int
    best_streak: int
    win_rate: float


class ScoreHistoryItem(BaseModel):
    game_date: date
    score: int
    status: str
    attempts: int


class GuessDistributionResponse(BaseModel):
    one_guess: int
    two_guesses: int
    three_guesses: int
    four_guesses: int
    five_guesses: int