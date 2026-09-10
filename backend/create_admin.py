from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.core.config import settings
from app.models.user import User

password_hash = PasswordHash.recommended()

engine = create_engine(settings.database_url)

email = "admin@guessthesong.com"
password = "Admin@123"
username = "admin"

with Session(engine) as db:
    existing = db.query(User).filter(User.email == email).first()

    if existing:
        existing.username = username
        existing.password_hash = password_hash.hash(password)
        existing.role = "ADMIN"
        db.commit()
        print("Admin account updated.")
    else:
        admin = User(
            username=username,
            email=email,
            password_hash=password_hash.hash(password),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        print("Admin account created.")

print(f"Email: {email}")
print(f"Password: {password}")