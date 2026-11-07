import subprocess
import sys


def main():
    """
    Start the Streamlit RAG Agent application.
    """

    command = [
        sys.executable,
        "-m",
        "streamlit",
        "run",
        "app/main.py"
    ]

    subprocess.run(command)


if __name__ == "__main__":
    main()