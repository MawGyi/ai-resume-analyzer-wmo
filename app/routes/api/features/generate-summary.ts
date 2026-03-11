import type { Route } from "./+types/generate-summary";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { resumeData, provider, customApiKey, customBaseUrl, customModel } = await request.json();

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is missing. Please provide one in the AI Configuration." }),
        { status: 400 }
      );
    }

    const { personalInfo, experience, education, skills } = resumeData || {};
    const expText = (experience || [])
      .map((e: any) => `${e.role} at ${e.company}: ${(e.highlights || []).join("; ")}`)
      .join("\n");
    const eduText = (education || [])
      .map((e: any) => `${e.degree} ${e.field ? "in " + e.field : ""} from ${e.institution}`)
      .join(", ");

    const prompt = `Write a concise, powerful professional summary (2-3 sentences) for this person's resume. Make it ATS-friendly with strong action words.

Name: ${personalInfo?.fullName || "Professional"}
Title: ${personalInfo?.title || ""}
Experience: ${expText || "Not provided"}
Education: ${eduText || "Not provided"}
Skills: ${(skills || []).join(", ") || "Not provided"}

Return ONLY the summary text, no quotes or labels.`;

    let summary = "";

    if (provider === "openai") {
      const openai = new OpenAI({ apiKey, baseURL: customBaseUrl || undefined });
      const response = await openai.chat.completions.create({
        model: customModel || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      summary = response.choices[0]?.message?.content?.trim() || "";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      summary = result.response.text().trim();
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Generate Summary Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate summary." }),
      { status: 500 }
    );
  }
}
