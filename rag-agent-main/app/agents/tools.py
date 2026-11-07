from langchain_core.tools import tool
from ddgs import DDGS

from app.retrieval.retriever import get_retriever


@tool
def search_knowledge_base(question: str) -> str:
    """
    Search the college knowledge base and return
    the most relevant information for a question.
    """

    retriever = get_retriever()

    documents = retriever.invoke(question)

    if not documents:
        return (
            "No relevant information was found "
            "in the knowledge base."
        )

    results = []

    for document in documents:

        source = document.metadata.get(
            "source",
            "Unknown source"
        )

        page = document.metadata.get(
            "page",
            "Unknown page"
        )

        results.append(
            f"""
Source: {source}
Page: {page}

Content:
{document.page_content}
"""
        )

    return "\n\n".join(results)


@tool
def web_search(query: str) -> str:
    """
    Search the web using DuckDuckGo and return
    relevant results for the user's question.

    Use this tool for general, current, or external
    information that may not be available in the
    college knowledge base.
    """

    try:
        results = DDGS().text(
            query,
            max_results=5
        )

        if not results:
            return "No relevant web search results were found."

        formatted_results = []

        for result in results:

            title = result.get(
                "title",
                "No title"
            )

            body = result.get(
                "body",
                "No description"
            )

            url = result.get(
                "href",
                ""
            )

            formatted_results.append(
                f"""
Title: {title}

Description:
{body}

URL:
{url}
"""
            )

        return "\n\n".join(formatted_results)

    except Exception as e:
        return f"Web search failed: {str(e)}"