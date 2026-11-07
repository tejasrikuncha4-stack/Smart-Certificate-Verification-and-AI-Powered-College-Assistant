from app.vectorstore.chroma_manager import get_vector_store
from app.config import TOP_K


def get_retriever():
    """
    Create a retriever from the ChromaDB vector store.
    """

    vector_store = get_vector_store()

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": TOP_K
        }
    )

    return retriever


def retrieve_documents(question: str):
    """
    Retrieve the most relevant document chunks
    for a given user question.
    """

    retriever = get_retriever()

    documents = retriever.invoke(question)

    return documents