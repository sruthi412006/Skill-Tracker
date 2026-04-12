# 🎯 AI Skill Tracker

An AI-powered web application for students to **track technical skills**, **upload resumes**,
and receive **personalised coaching** via a RAG (Retrieval-Augmented Generation) pipeline
backed by the **Endee vector database**.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔐 Auth | Signup · Login · Forgot Password · JWT tokens |
| 📄 Resume Scanner | Upload PDF → AI extracts skills, certs, projects |
| 🧠 Skill Tracker | Add · Edit · Delete · Progress tracking |
| 🔍 Semantic Search | Natural language search via Endee vector DB |
| 🤖 AI Coach | RAG-powered chat using OpenAI / HuggingFace |
| 📚 Course Tracker | Track courses with status and progress |
| 📊 Dashboard | Charts: level breakdown, progress, course status |
| 🏆 Leaderboard | Compare with other students |
| 👤 Profile | Edit profile, change password |
| 🌙 Dark Mode | Toggle light/dark theme |
| 📥 PDF Report | Download your progress report |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Streamlit |
| Backend / Auth | Python · JWT (python-jose) · bcrypt (passlib) |
| Database | SQLite (via Python `sqlite3`) |
| Vector DB | **Endee** |
| Embeddings | Sentence Transformers (`all-MiniLM-L6-v2`) |
| LLM | OpenAI GPT-3.5-turbo (or HuggingFace Mistral fallback) |
| Resume Parsing | PyPDF2 · Regex |
| Charts | Plotly |
| PDF Reports | fpdf2 |

---

## 🗂 Project Structure

```
ai-skill-tracker/
│
├── run.py                  ← Entry point (python run.py)
├── requirements.txt
│
├── config/
│   └── .env.example        ← Copy to .env, fill in API keys
│
├── frontend/
│   └── app.py              ← Streamlit UI (all pages)
│
├── backend/
│   └── auth.py             ← Auth: signup, login, JWT, profile
│
├── database/
│   ├── db_setup.py         ← SQLite schema + CRUD
│   └── vector_db.py        ← Endee integration + cosine fallback
│
├── ml/
│   ├── embed.py            ← Sentence Transformer embeddings
│   ├── resume_parser.py    ← PDF resume skill extractor
│   └── rag.py              ← Full RAG pipeline
│
└── docs/
    └── architecture.md
```

---

## 🚀 Quick Start (< 5 minutes)

### 1. Clone / Extract

```bash
cd ai-skill-tracker
```

### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure API keys

```bash
cp config/.env.example config/.env
```

Edit `config/.env`:

```env
OPENAI_API_KEY=sk-...          # OpenAI key (get from platform.openai.com)
ENDEE_API_KEY=...              # Endee key (get from endee.ai)
HF_API_TOKEN=hf_...            # HuggingFace token (free fallback)
SECRET_KEY=your-secret-here    # Any random string for JWT
```

> **No API key?** The app still works! It uses offline rule-based answers as fallback.

### 5. Run the app

```bash
python run.py
```

Or directly:

```bash
streamlit run frontend/app.py
```

Open **http://localhost:8501** in your browser.

---

## 🔑 Getting API Keys

### Endee (Vector Database) — **Required for semantic search**

1. Go to [https://endee.ai](https://endee.ai)
2. ⭐ **Star the repository** (required by the project brief)
3. **Fork the repository**
4. Sign up and copy your API key to `config/.env`

### OpenAI — *Optional (best AI responses)*

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create API key → paste in `.env`

### HuggingFace — *Free fallback*

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create token → paste in `.env`

---

## 🧠 What is RAG?

**RAG (Retrieval-Augmented Generation)** is an AI technique that:

1. **Retrieves** relevant information (your skills) from a vector database
2. **Augments** the LLM prompt with that context
3. **Generates** a personalised, accurate answer

Without RAG, an LLM gives generic advice. With RAG, it knows *your* skills
and gives advice tailored to *your* specific learning profile.

---

## 🗄 What is a Vector Database?

A vector database stores data as **high-dimensional numerical embeddings** (vectors).
Instead of exact keyword matching (SQL), it does **semantic similarity search** —
finding concepts that *mean* the same thing even if the words differ.

Example:
- Query: `"backend development"`
- Finds: `Node.js`, `Django`, `FastAPI`, `Express` — without matching those exact words

**Endee** is the vector database used in this project to store and search skill embeddings.

---

## 📐 System Architecture

```
Student
   │
   ▼
Streamlit UI (frontend/app.py)
   │
   ├──► Auth (backend/auth.py)  ◄──► SQLite (skill_tracker.db)
   │
   ├──► Skill CRUD (database/db_setup.py)
   │
   ├──► Resume Scanner (ml/resume_parser.py)
   │         └──► PyPDF2 + Keyword Extraction
   │
   ├──► Embedding Model (ml/embed.py)
   │         └──► Sentence Transformers (all-MiniLM-L6-v2)
   │
   ├──► Vector DB (database/vector_db.py)
   │         └──► Endee API  (fallback: cosine similarity)
   │
   └──► RAG Pipeline (ml/rag.py)
             ├──► embed_text(query)
             ├──► search_vectors()  →  Endee
             ├──► build_context()
             └──► LLM (OpenAI / HuggingFace / Offline)
                       └──► Personalised AI Answer
```

---

## 🧪 Testing the App

1. **Sign up** with a new account
2. Go to **Resume Scanner** → upload a `.pdf` resume → import skills
3. Go to **Skills** → search `"machine learning"` → see semantic results
4. Go to **AI Assistant** → ask `"What should I learn next?"`
5. Check **Dashboard** for visual analytics
6. Download **PDF Report**

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `Endee error` | Check `ENDEE_API_KEY` in `config/.env` |
| `OpenAI error` | Check `OPENAI_API_KEY`; app falls back to HuggingFace |
| Empty search results | Add skills first, then search |
| PDF report error | Run `pip install fpdf2` |
| Slow first load | Model downloads on first run (~22 MB), be patient |

---

## 📜 License

MIT — free to use and modify.
