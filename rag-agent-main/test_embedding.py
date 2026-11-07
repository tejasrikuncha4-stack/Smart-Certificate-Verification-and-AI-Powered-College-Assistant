from app.embeddings.embedding_manager import get_embedding_model


embeddings = get_embedding_model()

text = "Students must maintain minimum attendance."

vector = embeddings.embed_query(text)

print("Embedding generated successfully!")
print("Vector length:", len(vector))
print("First 10 values:", vector[:10])