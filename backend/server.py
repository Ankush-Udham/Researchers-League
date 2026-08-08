from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Depends, Header, Query
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

# ---------------- Object Storage ----------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "iiser-league"
storage_key = None

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"id": user["id"], "email": user["email"], "role": user.get("role")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: str
    password: str


class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    name: str
    team: str
    bio: str = ""
    role: str = ""
    photo_url: str = ""


class PlayerInput(BaseModel):
    number: int
    name: str
    team: str
    bio: str = ""
    role: str = ""
    photo_url: str = ""


class MatchUpdate(BaseModel):
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None
    status: Optional[str] = None
    venue: Optional[str] = None


class NewsInput(BaseModel):
    title: str
    body: str


class FeedbackInput(BaseModel):
    name: str = ""
    email: str = ""
    message: str


class SettingsInput(BaseModel):
    league_name: Optional[str] = None
    logo_url: Optional[str] = None
    tagline: Optional[str] = None
    developer_about: Optional[str] = None
    developer_image_url: Optional[str] = None
    history: Optional[list] = None
    teams: Optional[list] = None
    sports: Optional[list] = None
    matches_per_pair: Optional[int] = None


SPORTS = {"TT": "Table Tennis", "LT": "Lawn Tennis", "BT": "Badminton"}
TEAMS = ["Team A", "Team B", "Team C"]
PAIRS = [("Team A", "Team B"), ("Team A", "Team C"), ("Team B", "Team C")]


# ---------------- Auth endpoints ----------------
@api_router.post("/auth/login")
async def login(data: LoginInput):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return {"access_token": token, "user": {"email": user["email"], "role": user.get("role")}}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ---------------- Settings ----------------
@api_router.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"id": "site"}, {"_id": 0})
    if not s:
        s = {"id": "site", "league_name": "IISER Mohali Sports League",
             "tagline": "6 Players · 3 Teams · 3 Sports", "logo_url": "",
             "developer_about": "", "developer_image_url": "", "history": [],
             "teams": [{"name": "Team A", "color": "#FF3B30"}, {"name": "Team B", "color": "#007AFF"}, {"name": "Team C", "color": "#22C55E"}],
             "sports": [{"code": "TT", "name": "Table Tennis"}, {"code": "LT", "name": "Lawn Tennis"}, {"code": "BT", "name": "Badminton"}],
             "matches_per_pair": 5}
        await db.settings.insert_one(s)
        s.pop("_id", None)
    return s


@api_router.put("/settings")
async def update_settings(data: SettingsInput, admin: dict = Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.settings.update_one({"id": "site"}, {"$set": update}, upsert=True)
    return await db.settings.find_one({"id": "site"}, {"_id": 0})


# ---------------- Players ----------------
@api_router.get("/players")
async def get_players():
    players = await db.players.find({}, {"_id": 0}).sort("number", 1).to_list(100)
    return players


@api_router.post("/players")
async def create_player(data: PlayerInput, admin: dict = Depends(get_current_admin)):
    p = Player(**data.model_dump())
    await db.players.insert_one(p.model_dump())
    return p.model_dump()


@api_router.put("/players/{player_id}")
async def update_player(player_id: str, data: PlayerInput, admin: dict = Depends(get_current_admin)):
    await db.players.update_one({"id": player_id}, {"$set": data.model_dump()})
    return await db.players.find_one({"id": player_id}, {"_id": 0})


@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str, admin: dict = Depends(get_current_admin)):
    await db.players.delete_one({"id": player_id})
    return {"ok": True}


# ---------------- Matches ----------------
@api_router.get("/matches")
async def get_matches(sport: Optional[str] = None):
    q = {"sport": sport} if sport else {}
    matches = await db.matches.find(q, {"_id": 0}).sort([("sport", 1), ("round", 1)]).to_list(500)
    return matches


@api_router.put("/matches/{match_id}")
async def update_match(match_id: str, data: MatchUpdate, admin: dict = Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if "team1_score" in update and "team2_score" in update:
        update["status"] = update.get("status", "completed")
    await db.matches.update_one({"id": match_id}, {"$set": update})
    return await db.matches.find_one({"id": match_id}, {"_id": 0})


@api_router.get("/standings")
async def get_standings():
    settings = await db.settings.find_one({"id": "site"})
    dynamic_sports = [s["code"] for s in settings.get("sports", [])]
    dynamic_teams = [t["name"] for t in settings.get("teams", [])]
    
    matches = await db.matches.find({"status": "completed"}, {"_id": 0}).to_list(500)
    result = {}
    for sport in dynamic_sports:
        table = {t: {"team": t, "played": 0, "won": 0, "lost": 0, "pf": 0, "pa": 0, "points": 0} for t in dynamic_teams}

        for m in matches:
            if m["sport"] != sport:
                continue
            t1, t2 = m["team1"], m["team2"]
            s1 = m.get("team1_score") or 0
            s2 = m.get("team2_score") or 0
            table[t1]["played"] += 1
            table[t2]["played"] += 1
            table[t1]["pf"] += s1
            table[t1]["pa"] += s2
            table[t2]["pf"] += s2
            table[t2]["pa"] += s1
            if s1 > s2:
                table[t1]["won"] += 1
                table[t2]["lost"] += 1
                table[t1]["points"] += 3
            elif s2 > s1:
                table[t2]["won"] += 1
                table[t1]["lost"] += 1
                table[t2]["points"] += 3
            else:
                table[t1]["points"] += 1
                table[t2]["points"] += 1
        rows = sorted(table.values(), key=lambda r: (r["points"], r["won"], r["pf"] - r["pa"]), reverse=True)
        result[sport] = rows
    # overall
    overall = {t: {"team": t, "played": 0, "won": 0, "lost": 0, "pf": 0, "pa": 0, "points": 0} for t in TEAMS}
    for sport in SPORTS:
        for r in result[sport]:
            for k in ["played", "won", "lost", "pf", "pa", "points"]:
                overall[r["team"]][k] += r[k]
    result["OVERALL"] = sorted(overall.values(), key=lambda r: (r["points"], r["won"], r["pf"] - r["pa"]), reverse=True)
    return result


# ---------------- News ----------------
@api_router.get("/news")
async def get_news():
    return await db.news.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.post("/news")
async def create_news(data: NewsInput, admin: dict = Depends(get_current_admin)):
    doc = {"id": str(uuid.uuid4()), "title": data.title, "body": data.body,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.news.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, admin: dict = Depends(get_current_admin)):
    await db.news.delete_one({"id": news_id})
    return {"ok": True}


# ---------------- Feedback ----------------
@api_router.post("/feedback")
async def create_feedback(data: FeedbackInput):
    doc = {"id": str(uuid.uuid4()), **data.model_dump(),
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.feedback.insert_one(doc)
    return {"ok": True}


@api_router.get("/feedback")
async def list_feedback(admin: dict = Depends(get_current_admin)):
    return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ---------------- Gallery ----------------
@api_router.post("/gallery/upload")
async def upload_photo(file: UploadFile = File(...), caption: str = Query("")):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only image files allowed")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Max file size is 10MB")
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    content_type = MIME_TYPES[ext]
    result = put_object(path, data, content_type)
    doc = {"id": str(uuid.uuid4()), "storage_path": result["path"], "caption": caption,
           "content_type": content_type, "is_deleted": False,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/gallery")
async def list_gallery():
    return await db.gallery.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.delete("/gallery/{photo_id}")
async def delete_photo(photo_id: str, admin: dict = Depends(get_current_admin)):
    await db.gallery.update_one({"id": photo_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}


# Generic image upload (admin) for logo / player photos / developer image
@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only image files allowed")
    data = await file.read()
    path = f"{APP_NAME}/assets/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, MIME_TYPES[ext])
    doc = {"storage_path": result["path"], "content_type": MIME_TYPES[ext]}
    await db.assets.insert_one({**doc, "id": str(uuid.uuid4())})
    return doc


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.gallery.find_one({"storage_path": path}) or await db.assets.find_one({"storage_path": path})
    data, content_type = get_object(path)
    ct = record.get("content_type") if record else content_type
    return Response(content=data, media_type=ct, headers={"Cache-Control": "public, max-age=86400"})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({"id": str(uuid.uuid4()), "email": email,
                                   "password_hash": hash_password(password), "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


async def seed_matches():
    count = await db.matches.count_documents({})
    if count > 0:
        return
    docs = []
    for sport in SPORTS:
        for (t1, t2) in PAIRS:
            for rnd in range(1, 6):
                docs.append({"id": str(uuid.uuid4()), "sport": sport, "team1": t1, "team2": t2,
                             "round": rnd, "scheduled_date": "", "scheduled_time": "",
                             "venue": "IISER Mohali Sports Complex",
                             "team1_score": None, "team2_score": None, "status": "scheduled"})
    await db.matches.insert_one({"id": "seed-marker", "sport": "_", "team1": "", "team2": "",
                                 "round": 0, "status": "meta"})
    await db.matches.delete_one({"id": "seed-marker"})
    if docs:
        await db.matches.insert_many(docs)


async def seed_players():
    # If the database is empty, it will auto-fill with these exact names and photo links
    default = [
        {"number": 1, "name": "Dinesh", "team": "Team A", "role": "Captain", "photo_url": "/player1.png", "bio": "Type bio here..."},
        {"number": 2, "name": "Real Name 2", "team": "Team A", "role": "All-rounder", "photo_url": "/player2.png", "bio": "Type bio here..."},
        {"number": 3, "name": "Real Name 3", "team": "Team B", "role": "Captain", "photo_url": "/player3.png", "bio": "Type bio here..."},
        {"number": 4, "name": "Real Name 4", "team": "Team B", "role": "All-rounder", "photo_url": "/player4.png", "bio": "Type bio here..."},
        {"number": 5, "name": "Real Name 5", "team": "Team C", "role": "Captain", "photo_url": "/player5.png", "bio": "Type bio here..."},
        {"number": 6, "name": "Real Name 6", "team": "Team C", "role": "All-rounder", "photo_url": "/player6.png", "bio": "Type bio here..."},
    ]
    for d in default:
        # This securely updates the database based on their jersey number
        await db.players.update_one({"number": d["number"]}, {"$set": d}, upsert=True)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_matches()
    await seed_players()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
