import type { Route } from "./+types/interview-questions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { resumeText, jobDescription, difficulty, provider, customApiKey, customBaseUrl, customModel } = await request.json();

    if (!resumeText) {
      return new Response(JSON.stringify({ error: "Resume text is required." }), { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is missing. Please provide one in the AI Configuration." }),
        { status: 400 }
      );
    }

    const jdContext = jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : "general industry standards for this candidate's apparent role.";
    
    let difficultyContext = "";
    if (difficulty === "easy") difficultyContext = "Focus purely on standard behavioral questions and high-level experience overviews.";
    if (difficulty === "medium") difficultyContext = "Mix standard behavioral questions with specific inquiries into their technical/hard skills listed.";
    if (difficulty === "hard") difficultyContext = "Focus on challenging edge-cases, deep dives into their specific projects, and highly complex scenarios based on their resume.";

    const prompt = `You are an expert technical interviewer. Based on the candidate's resume and the target job description, generate 5 highly specific interview questions.
    
    ${difficultyContext}
    
    Target Context: ${jdContext}
    
    Candidate's Resume:\n${resumeText}
    
    You must output your response EXACTLY as a valid JSON array of objects. Do not wrap it in markdown code blocks (\`\`\`json).
    Structure the array like this:
    [
      {
        "question": "The specific interview question here",
        "rationale": "Why this question is important to ask this specific candidate",
        "hints": [
          "Hint 1 on how the candidate should answer",
          "Hint 2 on what to emphasize"
        ]
      }
    ]
    `;

    let questionsRaw = "";

    if (provider === "openai") {
      if (!customBaseUrl || !customModel) {
        return new Response(
          JSON.stringify({ error: "Base URL and Model name are required for OpenAI compatible providers." }),
          { status: 400 }
        );
      }
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: customBaseUrl,
      });

      const response = await openai.chat.completions.create({
        model: customModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      
      questionsRaw = response.choices[0]?.message?.content?.trim() || "[]";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      questionsRaw = result.response.text().trim();
    }

    // Clean up markdown markers if mistakenly added
    if (questionsRaw.startsWith("```json")) {
        questionsRaw = questionsRaw.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (questionsRaw.startsWith("```")) {
        questionsRaw = questionsRaw.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    
    // Parse JSON
    let parsedQuestions = [];
    try {
        const parsed = JSON.parse(questionsRaw);
        if (Array.isArray(parsed)) {
            parsedQuestions = parsed;
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)) {
            parsedQuestions = parsed.questions;
        } else {
             // Fallback
             parsedQuestions = [parsed];
        }
    } catch(e) {
        console.error("Failed to parse JSON questions:", questionsRaw);
        return new Response(JSON.stringify({ error: "AI returned malformed JSON instead of the requested format." }), { status: 500 });
    }

    return new Response(JSON.stringify({ questions: parsedQuestions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Interview Q Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate questions." }),
      { status: 500 }
    );
  }
}
