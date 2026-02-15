# 🚀 AI Resume Screener & Analyzer (Powered by Gemini Pro)

**Transform recruitment with AI. Screen resumes, extract skills, and rank candidates instantly.**

![Project Banner](https://placehold.co/1200x400/indigo/white?text=AI+Resume+Screener+Dashboard)

## 💡 Why This Tool?

Recruiters spend an average of **7 seconds** scanning a resume. Manual screening is slow, biased, and prone to error. 

This project solves that by using **Google's Gemini Pro 1.5 LLM** to:
1. **Parse Complex PDFs:** Understands layout, context, and nuance (not just keyword matching).
2. **Score Relevance:** Calculates a 0-100% match score against specific Job Descriptions (JD).
3. **Visualize Gaps:** Instantly highlights missing skills via interactive charts.

## ✨ Key Features

- **📂 Drag & Drop Upload:** Modern, intuitive UI for PDF uploads.
- **🤖 LLM-Powered Analysis:** Deep semantic understanding of candidate profiles.
- **📊 Interactive Scoring:** Visual breakdown of Match Score using Recharts.
- **⚡ Real-Time Feedback:** Actionable insights on what to improve.
- **🔒 Privacy First:** Resume data is processed in-memory and not stored persistently.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | [React Router v7 (Remix)](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons |
| **Visualization** | [Recharts](https://recharts.org/) |
| **AI Model** | [Google Gemini Pro 1.5](https://ai.google.dev/) |
| **PDF Parsing** | `pdf-parse` (Server-Side) |
| **Runtime** | Node.js 20+ |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Google AI Studio API Key (`GEMINI_API_KEY`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MawGyi/ai-resume-analyzer-wmo.git
   cd ai-resume-analyzer-wmo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📦 Deployment

### Docker

Build and run the container locally:

```bash
docker build -t ai-resume-analyzer .
docker run -p 3000:3000 ai-resume-analyzer
```

### Vercel / Netlify

This project is optimized for edge-ready deployment. simply import this repo into Vercel/Netlify dashboard.

---

## 👨‍💻 Author

**Win Maw Oo**  
*Technical Business Analyst | Product Owner | Full Stack Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/win-maw-oo-33265560/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-purple?style=flat)](https://wmoportfolio.vercel.app/)

---

*Star ⭐ this repo if you find it useful!*
