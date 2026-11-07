from langchain_chroma import Chroma

from app.config import CHROMA_DIR
from app.embeddings.embedding_manager import get_embedding_model


COLLECTION_NAME = "college_knowledge"


def get_vector_store():
    """
    Create or load the ChromaDB vector store.
    """

    embeddings = get_embedding_model()

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR
    )

    return vector_store


def add_documents(documents):
    """
    Add document chunks to ChromaDB.
    """

    vector_store = get_vector_store()

    if documents:
        vector_store.add_documents(documents)

    return vector_store


def get_document_count():
    """
    Return the number of chunks currently stored
    in ChromaDB.
    """

    vector_store = get_vector_store()

    return vector_store._collection.count()


def clear_vector_store():
    """
    Delete all existing vectors from ChromaDB.
    Useful when rebuilding the knowledge base.
    """

    vector_store = get_vector_store()

    collection = vector_store._collection

    if collection.count() > 0:
        collection.delete(
            where={}
        )

    return True