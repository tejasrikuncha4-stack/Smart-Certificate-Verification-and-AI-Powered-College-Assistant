from google import genai

from app.config import GOOGLE_API_KEY


client = genai.Client(
    api_key=GOOGLE_API_KEY
)


print("\nAVAILABLE GEMINI MODELS")
print("=" * 70)


try:

    models = client.models.list()

    for model in models:

        print(f"\nModel: {model.name}")

        print("Display Name:", model.display_name)

        print("Supported Actions:")

        for action in model.supported_actions:
            print(f"  - {action}")


except Exception as error:

    print("\nERROR:")
    print(error)