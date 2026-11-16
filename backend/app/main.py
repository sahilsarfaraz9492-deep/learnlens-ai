import os
import json
from contextlib import asynccontextmanager

import psycopg2
import redis

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
        connection.commit()
    finally:
        connection.close()

    yield

    redis_client.close()


app = FastAPI(
    title="LearnLens AI",
    description="AI-powered developer knowledge management platform",
    version="1.0.0",
    lifespan=lifespan
)


class NoteCreate(BaseModel):
    title: str
    content: str


@app.get("/")
def home():
    return {
        "message": "Welcome to LearnLens AI",
        "status": "running"
    }


@app.get("/health")
def health_check():
    try:
        connection = get_db_connection()
        connection.close()
        redis_client.ping()

        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "application": "LearnLens AI"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="A dependent service is unavailable"
        )


@app.post("/notes")
def create_note(note: NoteCreate):
    try:
        connection = get_db_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO notes (title, content)
                    VALUES (%s, %s)
                    RETURNING id, title, content, created_at;
                    """,
                    (note.title, note.content)
                )
                result = cursor.fetchone()

            connection.commit()

            # Clear old cached notes after a new note is saved.
            try:
                redis_client.delete("notes:all")
            except redis.RedisError:
                pass

            return {
                "id": result[0],
                "title": result[1],
                "content": result[2],
                "created_at": result[3].isoformat()
            }
        finally:
            connection.close()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not save note"
        )


@app.get("/notes")
def get_notes():
    # First, try to retrieve notes from Redis.
    try:
        cached_notes = redis_client.get("notes:all")

        if cached_notes:
            return json.loads(cached_notes)
    except (redis.RedisError, json.JSONDecodeError):
        pass

    # If cache is empty, retrieve notes from PostgreSQL.
    try:
        connection = get_db_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, title, content, created_at
                    FROM notes
                    ORDER BY id DESC;
                """)
                rows = cursor.fetchall()

            notes = [
                {
                    "id": row[0],
                    "title": row[1],
                    "content": row[2],
                    "created_at": row[3].isoformat()
                }
                for row in rows
            ]
        finally:
            connection.close()

        # Save the result in Redis for 60 seconds.
        try:
            redis_client.setex(
                "notes:all",
                60,
                json.dumps(notes)
            )
        except redis.RedisError:
            pass

        return notes

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve notes"
        )
