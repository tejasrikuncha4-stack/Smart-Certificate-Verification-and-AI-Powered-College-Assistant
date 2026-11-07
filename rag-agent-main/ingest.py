from app.rag.ingest import ingest_documents


if __name__ == "__main__":
    count = ingest_documents()

    print()
    print(f"Knowledge base ready with {count} chunks.")