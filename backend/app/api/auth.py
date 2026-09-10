from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.core.database import get_db
from app.core.security import (
    AUTH_COOKIE_NAME,
    TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
)


router = APIRouter()


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        path="/",
    )


@router.post("/anonymous", response_model=UserResponse)
def anonymous_login(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Get or create an anonymous player.

    Existing valid session cookie -> reuse player.
    No valid cookie -> create a new player.
    """

    existing_token = request.cookies.get(AUTH_COOKIE_NAME)

    if existing_token:
        try:
            from app.core.security import decode_access_token

            user_id = decode_access_token(existing_token)

            user = (
                db.query(User)
                .filter(
                    User.id == user_id,
                    User.role == "PLAYER",
                )
                .first()
            )

            if user:
                set_auth_cookie(response, existing_token)
                return user

        except HTTPException:
            pass

    # Create a new anonymous player.
    player_count = (
        db.query(User)
        .filter(User.role == "PLAYER")
        .count()
    )

    username = f"player_{player_count + 1}"

    while db.query(User).filter(User.username == username).first():
        player_count += 1
        username = f"player_{player_count + 1}"

    user = User(
        username=username,
        email=None,
        password_hash=None,
        role="PLAYER",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return user


@router.post("/admin/login", response_model=UserResponse)
def admin_login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == payload.email,
            User.role == "ADMIN",
        )
        .first()
    )

    if (
        not user
        or not user.password_hash
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials",
        )

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        path="/",
    )

    return {
        "message": "Logged out successfully",
    }


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user


# Temporary legacy endpoints.
# We can remove these once the frontend is completely migrated.


@router.post("/register")
def register(
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(
            status_code=409,
            detail="Username already taken",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="PLAYER",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {
        "message": "Account created",
        "user": user,
    }