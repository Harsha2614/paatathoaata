from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    movie_name: Mapped[str] = mapped_column(String(255), index=True)

    clips = relationship(
        "SongClip",
        back_populates="song",
        cascade="all, delete-orphan",
        order_by="SongClip.chunk_number",
    )
    daily_games = relationship("DailyGame", back_populates="song")
