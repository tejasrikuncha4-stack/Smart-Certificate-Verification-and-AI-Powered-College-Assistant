from app.loaders.pdf_loader import load_all_pdfs
from app.loaders.text_splitter import split_documents
from app.vectorstore.chroma_manager import add_documents


def ingest_documents():
    """
    Load all PDFs, split them into chunks,
    and store the chunks in ChromaDB.
    """

    print("Loading PDF documents...")

    documents = load_all_pdfs()

    if not documents:
        print("No PDF documents found.")
        return 0

    print(f"Loaded {len(documents)} pages.")

    print("Splitting documents into chunks...")

    chunks = split_documents(documents)

    print(f"Created {len(chunks)} chunks.")

    print("Adding chunks to ChromaDB...")

    add_documents(chunks)

    print("Documents successfully added to ChromaDB.")

    return len(chunks)