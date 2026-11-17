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


# Curated learning resources from official documentation.
LEARNING_RESOURCES = [
    {
        "id": 1,
        "title": "Linux Command Line",
        "technology": "Linux",
        "level": "Beginner",
        "description": "Learn Linux commands, shell basics, files, permissions and processes.",
        "url": "https://ubuntu.com/tutorials/command-line-for-beginners"
    },
    {
        "id": 2,
        "title": "AWS Documentation",
        "technology": "AWS",
        "level": "Beginner",
        "description": "Explore AWS cloud services, architecture and hands-on tutorials.",
        "url": "https://docs.aws.amazon.com/"
    },
    {
        "id": 3,
        "title": "Docker Get Started",
        "technology": "Docker",
        "level": "Beginner",
        "description": "Learn containers, images, Dockerfiles and container management.",
        "url": "https://docs.docker.com/get-started/"
    },
    {
        "id": 4,
        "title": "Kubernetes Basics",
        "technology": "Kubernetes",
        "level": "Beginner",
        "description": "Understand Pods, Deployments, Services and cluster management.",
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"
    },
    {
        "id": 5,
        "title": "Terraform Tutorials",
        "technology": "Terraform",
        "level": "Beginner",
        "description": "Practice Infrastructure as Code with Terraform tutorials.",
        "url": "https://developer.hashicorp.com/terraform/tutorials"
    },
    {
        "id": 6,
        "title": "Jenkins User Documentation",
        "technology": "Jenkins",
        "level": "Beginner",
        "description": "Learn Jenkins pipelines, automation and CI/CD.",
        "url": "https://www.jenkins.io/doc/"
    },
    {
        "id": 7,
        "title": "Git Documentation",
        "technology": "Git",
        "level": "Beginner",
        "description": "Learn version control, commits, branches and merging.",
        "url": "https://git-scm.com/doc"
    }
]


@app.get("/resources")
def get_resources(
    technology: str | None = None,
    search: str | None = None
):
    resources = LEARNING_RESOURCES

    if technology:
        resources = [
            resource for resource in resources
            if resource["technology"].lower() == technology.strip().lower()
        ]

    if search:
        query = search.strip().lower()
        resources = [
            resource for resource in resources
            if query in resource["title"].lower()
            or query in resource["description"].lower()
            or query in resource["technology"].lower()
        ]

    return {
        "count": len(resources),
        "resources": resources
    }
