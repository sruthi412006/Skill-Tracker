# Entry point for AI Skill Tracker
# Run: python run.py   OR   streamlit run frontend/app.py

import subprocess, sys, os

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("  🎯  AI Skill Tracker — Starting …")
    print("=" * 60)
    print("\n  → Open browser at  http://localhost:8501\n")
    subprocess.run([
        sys.executable, "-m", "streamlit", "run", "frontend/app.py",
        "--server.port", "8501",
        "--server.headless", "false",
    ])

if __name__ == "__main__":
    main()
