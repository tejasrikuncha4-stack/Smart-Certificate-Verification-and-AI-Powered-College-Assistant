
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agents.rag_agent import ask_agent
from app.vectorstore.chroma_manager import get_document_count

app = FastAPI(
    title="CODENOVA RAG API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "CODENOVA RAG API"
    }


@app.get("/documents/count")
def documents_count():
    try:
        return {"count": get_document_count()}
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Knowledge base is not ready."
        )


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        answer = ask_agent(request.question)

        return {
            "success": True,
            "answer": answer
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="RAG assistant could not process the question."
        )
