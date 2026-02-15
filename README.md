# 🚀 AI Resume Screener & Analyzer (Powered by Gemini Pro)

**Stop manual screening. Let AI analyze, score, and rank candidates instantly.**

This project leverages **Google's Gemini Pro 1.5** LLM to parse resumes, extract key skills, and compare them against job descriptions. Built with **React Router v7 (Remix)** for a blazing fast full-stack experience.

![Project Banner](https://placehold.co/1200x400?text=AI+Resume+Analyzer)

## ✨ Key Features

- **🤖 LLM-Powered Analysis:** Uses Google Gemini Pro to understand context, not just keywords.
- **📊 Automated Scoring:** Generates a match score (0-100%) based on Job Description (JD) relevance.
- **💡 Skill Gap Identification:** Highlights missing skills critical for the role.
- **📝 Actionable Feedback:** Provides specific advice on how to improve the resume.
- **⚡ Modern Stack:** Built with React Router (SSR), Tailwind CSS v4, and TypeScript.

## 🛠️ Tech Stack

- **Framework:** [React Router v7](https://reactrouter.com/) (formerly Remix)
- **AI Model:** [Google Gemini Pro 1.5](https://ai.google.dev/) via Vercel AI SDK
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment:** Docker / Vercel ready

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

This project is optimized for edge-ready deployment. Simply import this repo into Vercel/Netlify dashboard.

---

## 👨‍💻 Author

**Win Maw Oo**  
*Technical Business Analyst | Product Owner | Full Stack Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/win-maw-oo-33265560/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-purple?style=flat)](https://wmoportfolio.vercel.app/)

---

*Star ⭐ this repo if you find it useful!*
