from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from app.config import OPENROUTER_API_KEY, LLM_MODEL
from app.agents.tools import (
    search_knowledge_base,
    web_search
)


# =========================
# Initialize OpenRouter LLM
# =========================

llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    temperature=0.2
)


# =========================
# System Prompt
# =========================

SYSTEM_PROMPT = """
You are an intelligent college knowledge assistant.

Your job is to help users by providing accurate,
useful, and clearly explained answers.

You have access to two tools:

1. search_knowledge_base
   - Searches the college's internal documents.
   - Use this for college-specific information.
   - Examples:
     * College rules
     * Attendance requirements
     * Examination regulations
     * Academic policies
     * College procedures
     * Information contained in uploaded PDFs

2. web_search
   - Searches the public web using DuckDuckGo.
   - Use this for general, current, or external information.
   - Examples:
     * Latest technology information
     * Current events
     * General programming questions
     * Information not available in the college documents

Tool selection rules:

1. For college-specific questions, ALWAYS use
   search_knowledge_base first.

2. If the required college information is not found
   in the knowledge base, clearly say that it was not
   found rather than inventing an answer.

3. Use web_search for general or current information
   that is outside the college knowledge base.

4. When a question requires both college information
   and external information, you may use both tools.

5. Do not invent information.

6. Base college-related answers on information retrieved
   from the college knowledge base.

7. When using the college knowledge base, mention the
   source document and page when available.

8. When using web search, clearly indicate that the
   information came from web sources.

9. Keep answers clear, concise, and useful.

10. If neither tool provides sufficient information,
    honestly tell the user that the information could
    not be found.
"""


# =========================
# Create RAG Agent
# =========================

rag_agent = create_agent(
    model=llm,
    tools=[
        search_knowledge_base,
        web_search
    ],
    system_prompt=SYSTEM_PROMPT
)


# =========================
# Ask Agent
# =========================

def ask_agent(question: str):
    """
    Send a question to the RAG Agent
    and return clean text output.
    """

    response = rag_agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": question
                }
            ]
        }
    )

    messages = response.get("messages", [])

    if not messages:
        return "No response was generated."

    final_message = messages[-1]

    content = final_message.content

    # Handle block-based responses
    if isinstance(content, list):

        text_parts = []

        for block in content:

            if isinstance(block, dict):

                if block.get("type") == "text":
                    text_parts.append(
                        block.get("text", "")
                    )

            elif isinstance(block, str):
                text_parts.append(block)

        return "\n".join(text_parts).strip()

    # Normal string response
    if isinstance(content, str):
        return content.strip()

    return str(content)