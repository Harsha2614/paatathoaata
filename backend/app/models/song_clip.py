from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SongClip(Base):
    __tablename__ = "song_clips"
    __table_args__ = (
        UniqueConstraint("song_id", "chunk_number", name="uq_song_chunk"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"))
    chunk_number: Mapped[int] = mapped_column(Integer)
    audio_url: Mapped[str] = mapped_column(String(1000))

    song = relationship("Song", back_populates="clips")
