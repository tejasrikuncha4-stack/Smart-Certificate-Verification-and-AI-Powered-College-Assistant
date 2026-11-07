import os
from dotenv import load_dotenv


load_dotenv()


# =========================
# API KEYS
# =========================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


if not OPENROUTER_API_KEY:
    raise ValueError(
        "OPENROUTER_API_KEY is not set. "
        "Please add it to your .env file."
    )


# =========================
# RAG CONFIGURATION
# =========================

DOCUMENTS_DIR = "data/documents"
CHROMA_DIR = "data/chroma_db"


# =========================
# LLM CONFIGURATION
# =========================

LLM_MODEL = "openrouter/free"


# =========================
# EMBEDDING CONFIGURATION
# =========================

EMBEDDING_MODEL = "all-MiniLM-L6-v2"


# =========================
# CHUNKING CONFIGURATION
# =========================

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


# =========================
# RETRIEVAL CONFIGURATION
# =========================

TOP_K = 4