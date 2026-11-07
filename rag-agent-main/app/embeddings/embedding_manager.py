from sentence_transformers import SentenceTransformer

from app.config import EMBEDDING_MODEL


class LocalEmbeddingFunction:
    """
    Local embedding function for ChromaDB.

    Uses SentenceTransformers, so no Gemini API
    or external embedding API is required.
    """

    def __init__(self):
        self.model = SentenceTransformer(EMBEDDING_MODEL)

    def embed_documents(self, texts):
        """
        Create embeddings for multiple documents.
        """

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True
        )

        return embeddings.tolist()

    def embed_query(self, text):
        """
        Create an embedding for a single query.
        """

        embedding = self.model.encode(
            text,
            convert_to_numpy=True
        )

        return embedding.tolist()


def get_embedding_model():
    """
    Return the local embedding model.
    """

    return LocalEmbeddingFunction()