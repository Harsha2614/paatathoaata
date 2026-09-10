from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean
from app.core.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    daily_game_id: Mapped[int] = mapped_column(ForeignKey("daily_games.id"))
    current_chunk: Mapped[int] = mapped_column(Integer, default=1)
    attempts_used: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="PLAYING")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stats_eligible: Mapped[bool] = mapped_column(Boolean,default=True,nullable=False,)

    user = relationship("User", back_populates="sessions")
    daily_game = relationship("DailyGame", back_populates="sessions")
    attempts = relationship("Attempt", back_populates="game_session", cascade="all, delete-orphan")
