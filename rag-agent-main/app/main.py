import os
import streamlit as st

from app.config import DOCUMENTS_DIR
from app.rag.ingest import ingest_documents
from app.agents.rag_agent import ask_agent


# --------------------------------------------------
# Page Configuration
# --------------------------------------------------

st.set_page_config(
    page_title="College RAG Agent",
    page_icon="📚",
    layout="wide"
)


# --------------------------------------------------
# Application Header
# --------------------------------------------------

st.title("College Knowledge RAG Agent")

st.write(
    "Upload college documents and ask questions "
    "using an AI-powered RAG Agent."
)


# --------------------------------------------------
# Sidebar - Document Upload
# --------------------------------------------------

with st.sidebar:

    st.header("Knowledge Base")

    uploaded_files = st.file_uploader(
        "Upload PDF documents",
        type=["pdf"],
        accept_multiple_files=True
    )

    if uploaded_files:

        if st.button("Process Documents", use_container_width=True):

            os.makedirs(
                DOCUMENTS_DIR,
                exist_ok=True
            )

            progress = st.progress(0)

            for index, uploaded_file in enumerate(uploaded_files):

                file_path = os.path.join(
                    DOCUMENTS_DIR,
                    uploaded_file.name
                )

                with open(file_path, "wb") as file:
                    file.write(
                        uploaded_file.getbuffer()
                    )

                progress.progress(
                    (index + 1) / len(uploaded_files)
                )

            with st.spinner("Building knowledge base..."):

                count = ingest_documents()

            st.success(
                f"Knowledge base updated with {count} chunks."
            )


# --------------------------------------------------
# Chat History
# --------------------------------------------------

if "messages" not in st.session_state:

    st.session_state.messages = []


# --------------------------------------------------
# Display Previous Messages
# --------------------------------------------------

for message in st.session_state.messages:

    with st.chat_message(message["role"]):

        st.markdown(
            message["content"]
        )


# --------------------------------------------------
# Chat Input
# --------------------------------------------------

question = st.chat_input(
    "Ask something about the uploaded documents..."
)


if question:

    # Display user question
    with st.chat_message("user"):

        st.markdown(question)

    st.session_state.messages.append(
        {
            "role": "user",
            "content": question
        }
    )


    # Generate agent response
    with st.chat_message("assistant"):

        with st.spinner("Thinking..."):

            try:

                answer = ask_agent(question)

                st.markdown(answer)

            except Exception as error:

                answer = (
                    "Something went wrong while processing "
                    "your question."
                )

                st.error(
                    f"{answer}\n\nError: {error}"
                )


    # Save assistant response
    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": answer
        }
    )