import type { Route } from "./+types/cover-letter";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { resumeText, jobDescription, keyPoints, provider, customApiKey, customBaseUrl, customModel } = await request.json();

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

    const jdContext = jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : "";
    const keyPointsContext = keyPoints ? `\n\nMake sure to emphasize the following points:\n${keyPoints}` : "";

    const prompt = `You are an expert career coach writing a professional, highly personalized cover letter.
    Using the candidate's resume, write a cover letter that highlights their most relevant experiences.
    ${jdContext}
    ${keyPointsContext}
    
    Candidate's Resume:\n${resumeText}
    
    Format the cover letter professionally with standard business letter formatting (placeholders like [Hiring Manager Name] are fine).
    Keep it concise (3-4 paragraphs max). Match the tone to a modern, professional workplace.
    Return ONLY the cover letter text.`;

    let coverLetter = "";

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
      
      coverLetter = response.choices[0]?.message?.content?.trim() || "Failed to generate cover letter.";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      coverLetter = result.response.text().trim();
    }

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Cover Letter Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate cover letter." }),
      { status: 500 }
    );
  }
}
