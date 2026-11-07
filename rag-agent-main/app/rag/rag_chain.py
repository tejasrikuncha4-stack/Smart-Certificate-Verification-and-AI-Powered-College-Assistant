from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import GOOGLE_API_KEY, LLM_MODEL
from app.retrieval.retriever import get_retriever


# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL,
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2
)


# RAG Prompt Template
RAG_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a helpful knowledge assistant.

Answer the user's question using ONLY the
information provided in the context.

If the answer cannot be found in the context,
say:

"I could not find this information in the
provided documents."

Do not make up information.

Keep the answer clear, accurate, and concise.

Context:
{context}
"""
        ),
        (
            "human",
            "{question}"
        )
    ]
)


def format_documents(documents):
    """
    Convert retrieved documents into a single
    text context for the LLM.
    """

    formatted_context = []

    for document in documents:

        source = document.metadata.get(
            "source",
            "Unknown source"
        )

        page = document.metadata.get(
            "page",
            "Unknown page"
        )

        formatted_context.append(
            f"""
Source: {source}
Page: {page}

Content:
{document.page_content}
"""
        )

    return "\n\n".join(formatted_context)


def ask_rag(question: str):
    """
    Run the complete RAG pipeline:

    Question
        ↓
    Retrieval
        ↓
    Context
        ↓
    Prompt
        ↓
    Gemini
        ↓
    Answer
    """

    retriever = get_retriever()

    # Retrieve relevant documents
    documents = retriever.invoke(question)

    if not documents:
        return {
            "answer": "I could not find relevant information in the provided documents.",
            "sources": []
        }

    # Prepare context
    context = format_documents(documents)

    # Create prompt
    prompt = RAG_PROMPT.invoke(
        {
            "context": context,
            "question": question
        }
    )

    # Generate answer
    response = llm.invoke(prompt)

    # Collect source information
    sources = []

    for document in documents:

        source = document.metadata.get(
            "source",
            "Unknown source"
        )

        page = document.metadata.get(
            "page",
            "Unknown page"
        )

        sources.append(
            {
                "source": source,
                "page": page
            }
        )

    return {
        "answer": response.content,
        "sources": sources
    }