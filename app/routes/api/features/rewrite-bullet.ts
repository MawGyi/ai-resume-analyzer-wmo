import type { Route } from "./+types/rewrite-bullet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { bulletPoint, targetKeywords, provider, customApiKey, customBaseUrl, customModel } = await request.json();

    if (!bulletPoint) {
      return new Response(JSON.stringify({ error: "Bullet point is required." }), { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is missing. Please provide one in the AI Configuration." }),
        { status: 400 }
      );
    }

    let keywordInstruction = "";
    if (targetKeywords) {
      keywordInstruction = `\nMake sure to naturally incorporate the following keywords if applicable: ${targetKeywords}.`;
    }

    const prompt = `You are an expert technical resume writer. Your task is to rewrite the following resume bullet point to make it more impactful, metric-driven (if possible), and professional. Use strong action verbs.
    
    Original Bullet Point:
    "${bulletPoint}"
    ${keywordInstruction}
    
    Return ONLY the rewritten bullet point text and nothing else. Do not use quotes or introductory text.`;

    let rewritten = "";

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
      
      rewritten = response.choices[0]?.message?.content?.trim() || "Failed to generate rewrite.";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      rewritten = result.response.text().trim();
    }

    return new Response(JSON.stringify({ rewritten }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Rewrite Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to rewrite bullet point." }),
      { status: 500 }
    );
  }
}
