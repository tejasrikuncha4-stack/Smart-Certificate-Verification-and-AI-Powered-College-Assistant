from app.retrieval.retriever import retrieve_documents


question = "What is the minimum attendance required?"


documents = retrieve_documents(question)


print("\nNumber of documents retrieved:", len(documents))

print("\n" + "=" * 80)

for i, document in enumerate(documents, start=1):

    print(f"\nRESULT {i}")

    print("SOURCE:")
    print(document.metadata.get("source"))

    print("PAGE:")
    print(document.metadata.get("page"))

    print("\nCONTENT:")
    print(document.page_content)

    print("\n" + "=" * 80)