import type { Route } from "./+types/tailor";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { resumeText, jobDescription, provider, customApiKey, customBaseUrl, customModel } = await request.json();

    if (!resumeText) {
      return new Response(JSON.stringify({ error: "Resume text is required." }), { status: 400 });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return new Response(JSON.stringify({ error: "A Job Description is required for tailoring." }), { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is missing. Please provide one in the AI Configuration." }),
        { status: 400 }
      );
    }

    const prompt = `You are an expert resume tailoring specialist. Your job is to analyze a resume against a specific job description and produce precise, actionable tailoring suggestions that will make this resume a stronger match.

--- RESUME ---
${resumeText}
--- END RESUME ---

--- JOB DESCRIPTION ---
${jobDescription}
--- END JOB DESCRIPTION ---

Return a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "tailoredSummary": "<a rewritten professional summary that matches this specific JD, 2-3 sentences>",
  "bulletRewrites": [
    {
      "original": "<the original bullet point text from the resume that should be improved>",
      "suggested": "<the rewritten version tailored to the JD>",
      "reason": "<brief explanation of why this change strengthens the application>"
    }
  ],
  "skillsToAdd": ["<skill from JD that should be added to resume>"],
  "skillsToReorder": ["<skill already on resume that should be listed more prominently>"],
  "keywordsToInject": [
    { "keyword": "<keyword from JD>", "suggestedPlacement": "<where/how to naturally use it>" }
  ],
  "overallStrategy": "<1-2 sentence high-level strategy advice for this specific application>"
}

Provide 3-5 bullet rewrites focusing on the most impactful changes. Be specific and practical.`;

    let analysisJson;

    if (provider === "openai") {
      if (!customBaseUrl || !customModel) {
        return new Response(
          JSON.stringify({ error: "Base URL and Model are required for OpenAI compatible providers." }),
          { status: 400 }
        );
      }

      const openai = new OpenAI({ apiKey, baseURL: customBaseUrl });
      const response = await openai.chat.completions.create({
        model: customModel,
        messages: [{ role: "user", content: prompt }],
      });

      const responseText = response.choices[0]?.message?.content || "{}";
      try {
        analysisJson = JSON.parse(responseText);
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) analysisJson = JSON.parse(match[0]);
        else throw new Error("Could not parse AI response");
      }
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        analysisJson = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          analysisJson = JSON.parse(jsonMatch[1].trim());
        } else {
          const match = responseText.match(/\{[\s\S]*\}/);
          if (match) analysisJson = JSON.parse(match[0]);
          else throw new Error("Could not parse AI response");
        }
      }
    }

    // Safe defaults
    const validated = {
      tailoredSummary: analysisJson.tailoredSummary ?? "",
      bulletRewrites: Array.isArray(analysisJson.bulletRewrites) ? analysisJson.bulletRewrites : [],
      skillsToAdd: Array.isArray(analysisJson.skillsToAdd) ? analysisJson.skillsToAdd : [],
      skillsToReorder: Array.isArray(analysisJson.skillsToReorder) ? analysisJson.skillsToReorder : [],
      keywordsToInject: Array.isArray(analysisJson.keywordsToInject) ? analysisJson.keywordsToInject : [],
      overallStrategy: analysisJson.overallStrategy ?? "",
    };

    return new Response(JSON.stringify(validated), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Tailor Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Tailoring failed." }),
      { status: 500 }
    );
  }
}
