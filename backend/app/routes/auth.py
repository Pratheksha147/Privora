from fastapi import APIRouter
from app.database.mongodb import db
from app.models.user import User
import uuid
from app.models.user import User, LoginUser
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/")
def test():
    return {"message": "Auth working"}


@router.post("/signup")
def signup(user: User):

    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        return {"message": "User already exists"}

    # Generate Anonymous ID
    anon_id = "anon_" + str(uuid.uuid4())[:8]

    created_at = datetime.now().strftime("%Y-%m-%d")

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "anonId": anon_id,
        "createdAt": created_at
    }

    db.users.insert_one(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "email": user.email,
            "anonId": anon_id,
            "createdAt": created_at
        }
    }


@router.post("/login")
def login(user: LoginUser):

    existing_user = db.users.find_one({"email": user.email})

    if not existing_user:
        return {"message": "User not found"}

    if existing_user["password"] != user.password:
        return {"message": "Invalid password"}

    return {
        "message": "Login successful",
        "user": {
            "email": existing_user["email"],
            "anonId": existing_user["anonId"],
            "createdAt": existing_user["createdAt"]
        }
    } 