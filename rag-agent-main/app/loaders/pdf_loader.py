import os

from langchain_community.document_loaders import PyPDFLoader

from app.config import DOCUMENTS_DIR


def load_pdf(file_path: str):
    """
    Load a single PDF file and return its pages
    as LangChain Document objects.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )

    if not file_path.lower().endswith(".pdf"):
        raise ValueError(
            "Only PDF files are supported."
        )

    loader = PyPDFLoader(file_path)

    documents = loader.load()

    return documents


def load_all_pdfs():
    """
    Load all PDF files from the documents directory.
    """

    if not os.path.exists(DOCUMENTS_DIR):
        os.makedirs(DOCUMENTS_DIR)

    all_documents = []

    for filename in os.listdir(DOCUMENTS_DIR):

        if filename.lower().endswith(".pdf"):

            file_path = os.path.join(
                DOCUMENTS_DIR,
                filename
            )

            documents = load_pdf(file_path)

            all_documents.extend(documents)

    return all_documents