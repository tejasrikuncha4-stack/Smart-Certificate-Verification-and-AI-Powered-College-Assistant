python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip list

College RAG Agent --- Workshop & Hackathon Starter Kit

This is a ready-made Agentic RAG starter project for a 2-day GenAI
workshop and 3rd-day hackathon.

Students should not rebuild the RAG system during the hackathon.
They should adapt the starter kit to solve their problem statement.

1. What is already provided?

The starter project already contains:

PDF loading
Text chunking
Local embeddings using all-MiniLM-L6-v2
ChromaDB vector storage
Semantic retrieval
Knowledge-base search tool
OpenRouter LLM integration
Agent-based tool selection
DuckDuckGo web-search tool
Streamlit UI

Basic architecture:

PDF Documents
     ↓
PDF Loader
     ↓
Chunking
     ↓
Local Embeddings
     ↓
ChromaDB
     ↓
Knowledge Search Tool
     ↓
Agent
     ↓
OpenRouter LLM
     ↓
Final Answer

The agent can also use web search:

                 USER
                   ↓
                 AGENT
                /     \
               ↓       ↓
        Knowledge     Web Search
           Tool          Tool
             ↓            ↓
          ChromaDB     DuckDuckGo
             ↓            ↓
            PDFs       Internet
2. The most important hackathon rule

Do not ask:

How do I rebuild this RAG project?

Ask:

How can I use this RAG Agent to solve my problem statement?

The starter kit is the engine. The students build the solution.

3. Project structure
Rag Agent/
│
├── app/
│   ├── agents/
│   │   ├── rag_agent.py
│   │   └── tools.py
│   │
│   ├── embeddings/
│   │   └── embedding_manager.py
│   │
│   ├── retrieval/
│   │   └── retriever.py
│   │
│   ├── vectorstore/
│   │   └── chroma_manager.py
│   │
│   ├── loaders/
│   │   └── pdf_loader.py
│   │
│   ├── config.py
│   └── main.py
│
├── data/
│   ├── documents/
│   │   └── your PDFs
│   │
│   └── chroma_db/
│
├── .env
├── .gitignore
├── requirements.txt
├── ingest.py
├── run.py
└── README.md
4. What each important file does
app/config.py

Contains the API key, LLM model, document path, ChromaDB path, embedding
model, chunk settings, and retrieval settings.

app/loaders/pdf_loader.py

Reads PDF documents and converts them into documents for the RAG
pipeline.

app/embeddings/embedding_manager.py

Creates local embeddings using:

all-MiniLM-L6-v2

No Gemini API is required for embeddings.

app/vectorstore/chroma_manager.py

Creates/loads ChromaDB and stores document vectors.

app/retrieval/retriever.py

Performs similarity search and retrieves relevant chunks.

app/agents/tools.py

Contains the tools available to the agent:

search_knowledge_base
web_search

This is one of the main files students can extend.

app/agents/rag_agent.py

Creates the agent and defines the LLM, system prompt, tools, and agent
behavior.

This is another major file students can customize.

app/main.py

Contains the Streamlit frontend.

ingest.py

Reads documents and builds the ChromaDB knowledge base.

5. Initial setup

Create a virtual environment:

python -m venv venv

Activate it:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

If packages are missing:

pip install langchain
pip install langchain-openai
pip install langchain-chroma
pip install chromadb
pip install sentence-transformers
pip install pypdf
pip install streamlit
pip install python-dotenv
pip install ddgs
6. Configure OpenRouter

Create .env in the project root:

OPENROUTER_API_KEY=your_openrouter_api_key

Never commit .env to GitHub.

The project uses OpenRouter through the OpenAI-compatible LangChain
interface.

The request is sent to:

https://openrouter.ai/api/v1

This does not mean that the project is using the OpenAI API.

7. Add your documents

Put the documents required for your problem statement inside:

data/documents/

Example:

data/
└── documents/
    ├── handbook.pdf
    ├── rules.pdf
    ├── regulations.pdf
    └── faq.pdf

Only use documents relevant to your solution.

8. Build the knowledge base

Run:

python ingest.py

Expected process:

Loading PDF documents...
        ↓
Splitting documents into chunks...
        ↓
Creating embeddings...
        ↓
Adding chunks to ChromaDB...
        ↓
Knowledge base ready
9. When should you run ingest.py?

Run it when you:

add PDFs
remove PDFs
replace PDFs
substantially change your documents
change the embedding model

If you change the embedding model, delete:

data/chroma_db/

and run:

python ingest.py
10. Start the application

Run:

python run.py

or:

streamlit run app/main.py
11. Test the starter project first

Try:

What is the minimum attendance requirement?

The agent should use:

search_knowledge_base

Then try:

What is the latest version of Python?

The agent can use:

web_search

If both work, the starter project is ready.

12. Exact hackathon workflow

Follow these steps in order.

Step 1 --- Understand the problem statement

Write down:

What is the problem?
Who has the problem?
What information is required?
Where does the information come from?
What should the agent do?
What should the final user experience look like?

Do not start coding immediately.

Step 2 --- Identify the required knowledge

Ask:

What documents does my solution need?

Examples:

Education

Syllabus
Academic regulations
Exam rules
Placement policy

Agriculture

Crop guides
Government schemes
Farming manuals
Agricultural guidelines

Healthcare

Hospital policies
Patient information
Medical guidelines
Insurance documents

Legal

Acts
Rules
Policies
Government documents

Finance

Reports
Financial policies
Product documents
Regulations
Step 3 --- Add documents

Place relevant PDFs inside:

data/documents/
Step 4 --- Rebuild the knowledge base

Run:

python ingest.py

Wait until ingestion finishes successfully.

Step 5 --- Customize the agent

Open:

app/agents/rag_agent.py

Find:

SYSTEM_PROMPT = """
...
"""

Change the prompt to describe your problem.

Example:

SYSTEM_PROMPT = """
You are an agriculture information assistant.

Help farmers understand information from the
provided agricultural documents.

Use the knowledge base for agriculture-related
documents and use web search when current
external information is required.

Do not invent information.

Clearly distinguish information from the
knowledge base and web search.
"""

The prompt should define:

Who the agent is
Who it helps
What it should do
Which tool to prefer
What it must not do
Step 6 --- Decide whether you need more tools

Ask:

Can my problem be solved using the knowledge base and web search?

If yes, do not add unnecessary complexity.

If no, create a custom tool.

Possible tools:

Calculator
Database
Weather
Maps
Email
Calendar
Government API
Recommendation engine
Eligibility checker
13. Adding a custom tool

Tools are created in:

app/agents/tools.py

Example:

from langchain_core.tools import tool


@tool
def calculate(expression: str) -> str:
    """
    Calculate a mathematical expression.
    """

    try:
        result = eval(expression, {"__builtins__": {}})
        return str(result)

    except Exception as e:
        return f"Calculation failed: {str(e)}"

Then add it to rag_agent.py:

tools=[
    search_knowledge_base,
    web_search,
    calculate
]

For a production system, use a safer expression evaluator instead of
unrestricted eval.

14. Example: Student Placement Agent

Problem: Students don't know whether they are eligible for different
placement opportunities.

Documents:

placement_policy.pdf
company_requirements.pdf
placement_rules.pdf

Tools:

search_knowledge_base
web_search

Possible custom tools:

get_student_profile
check_eligibility

The agent can reason:

Student Profile
       +
Company Requirements
       +
Placement Rules
       ↓
Eligibility Analysis
       ↓
Answer
15. Example: Agriculture Agent

Problem: Farmers struggle to find information about schemes and crop
practices.

Knowledge base:

crop_guidelines.pdf
scheme_guidelines.pdf
farmer_benefits.pdf

Tools:

search_knowledge_base
web_search

Optional:

weather_tool
scheme_eligibility_tool
16. Example: College Agent

Problem: Students cannot easily find academic information.

Documents:

college_handbook.pdf
academic_regulations.pdf
examination_rules.pdf

Tools:

search_knowledge_base
web_search

Optional:

attendance_tool
student_profile_tool
timetable_tool
17. Multi-tool agent

A strong Agentic RAG solution may use multiple tools.

Example:

Question:
Can I write my end-semester exam with my current attendance?

The agent may need:

Student Attendance
        +
College Regulations
        ↓
Reasoning
        ↓
Answer

The objective is not to add many tools.

The objective is to add useful tools.

18. Modify the UI

Open:

app/main.py

You can customize:

application name
description
branding
input fields
sidebar
result layout
source display
additional controls

For example:

College Knowledge RAG Agent

can become:

AgriGuide AI
AI-powered agricultural information assistant
19. What NOT to change

Unless the problem requires it, don't modify:

embedding_manager.py
retriever.py
chroma_manager.py
pdf_loader.py

The hackathon focus should be:

Documents
Prompt
Tools
Agent behavior
UI
Problem-specific logic
20. Short-hackathon execution plan

If time is very limited:

First 20--30 minutes

Understand:

Problem
Target user
Expected output
Next 20--30 minutes

Collect:

5–15 relevant documents
Next 20--30 minutes

Run:

python ingest.py

Test retrieval.

Next 30 minutes

Modify:

SYSTEM_PROMPT

Test the agent.

Next 30--60 minutes

Add:

one meaningful custom tool

if required.

Remaining time

Improve:

UI
Testing
Demo
Presentation

Do not spend the final hour rebuilding infrastructure.

21. Testing checklist

Every team should test:

Test 1 --- Information that exists

Ask something clearly present in the documents.

Test 2 --- Information that does not exist

The agent should not hallucinate.

Test 3 --- Web search

Ask a current/general question.

Test 4 --- Multi-step question

Ask something requiring multiple pieces of information.

Test 5 --- Invalid/unrelated question

The agent should respond appropriately.

22. Common errors
ModuleNotFoundError

Example:

No module named 'langchain_openai'

Fix:

pip install langchain-openai
ChromaDB problems after changing embeddings

Delete:

data/chroma_db/

Then:

python ingest.py
OpenRouter API key error

Check .env:

OPENROUTER_API_KEY=...

Restart the application after changing .env.

Web search error

Install:

pip install ddgs
Empty knowledge base

Check:

data/documents/

contains valid PDFs.

Then:

python ingest.py
23. GitHub safety

Recommended .gitignore:

.env

venv/
.venv/

__pycache__/
*.py[cod]

data/chroma_db/

.streamlit/secrets.toml

*.log

.DS_Store
Thumbs.db

Never commit your API key.

24. What makes a good hackathon project?

A basic project:

PDF
 ↓
Question
 ↓
Answer

is only a basic RAG chatbot.

A stronger project:

Real Problem
     ↓
Relevant Knowledge
     ↓
RAG
     ↓
Agent
     ↓
Useful Tools
     ↓
Reasoning
     ↓
Action / Recommendation
     ↓
Good User Experience
25. Minimum hackathon requirements

Every team should have:

Clear problem statement
Relevant knowledge base
RAG retrieval
Agent
At least one meaningful tool
Working UI
Source-aware answers
Real demonstration

Recommended:

Web search
One custom tool
Better UI
Error handling
Evaluation questions

Advanced:

Database integration
Multiple tools
Multi-step reasoning
Action tools
Analytics
Authentication
Multi-agent architecture
26. Final architecture

Starter kit:

                    USER
                      ↓
                 STREAMLIT UI
                      ↓
                    AGENT
                      │
             ┌────────┴────────┐
             ↓                 ↓
     Knowledge Search      Web Search
             ↓                 ↓
          ChromaDB          DuckDuckGo
             ↓                 ↓
       Local Embeddings      Internet
             ↓
            PDFs

Students can extend it:

                         USER
                           ↓
                         AGENT
                           │
       ┌───────────────────┼───────────────────┐
       ↓                   ↓                   ↓
 Knowledge Base        Web Search         Custom Tools
       ↓                   ↓                   ↓
   ChromaDB             Internet          DB / API / etc.
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ↓
                       REASONING
                           ↓
                       FINAL ACTION
                           ↓
                           UI
27. Final mental model
RAG
=
Give the AI access to useful knowledge.

Agent
=
Give the AI the ability to choose and use tools.

Tools
=
Give the AI capabilities.

LLM
=
Give the AI reasoning and language ability.

UI
=
Give the user a way to interact with the system.

Together:

              AGENTIC RAG
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
    Knowledge    Tools       LLM
        │          │          │
     ChromaDB   APIs/DB/Web  OpenRouter
        │          │          │
        └──────────┼──────────┘
                   ↓
                  UI
28. Final rule for the hackathon

Start with the starter kit. Understand it. Adapt it. Extend it. Do
not rebuild it unless your problem genuinely requires a different
architecture.

The goal is not to write the most code.

The goal is to build the best working solution to the problem
statement in the available time.