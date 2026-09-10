from datetime import date
from sqlalchemy import Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DailyGame(Base):
    __tablename__ = "daily_games"
    __table_args__ = (
        UniqueConstraint("game_date", name="uq_daily_game_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"))
    game_date: Mapped[date] = mapped_column(Date, index=True)

    song = relationship("Song", back_populates="daily_games")
    sessions = relationship("GameSession", back_populates="daily_game")
