import type { Route } from "./+types/ats-check";
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

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is missing. Please provide one in the AI Configuration." }),
        { status: 400 }
      );
    }

    const jdSection = jobDescription && jobDescription.trim().length > 0
      ? `\n\n--- JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---`
      : "";

    const prompt = `You are an ATS (Applicant Tracking System) compatibility expert. Analyze this resume text for ATS compatibility and keyword optimization.

--- RESUME TEXT ---
${resumeText}
--- END RESUME TEXT ---${jdSection}

Return a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "atsScore": <number 0-100, overall ATS compatibility score>,
  "formatChecks": [
    { "check": "<check name>", "passed": true/false, "detail": "<explanation>" }
  ],
  "sectionDetection": [
    { "section": "<section name like Summary, Experience, Education, Skills, Contact>", "found": true/false, "quality": "<brief assessment>" }
  ],
  "keywordAnalysis": {
    "found": [{ "keyword": "<keyword>", "count": <number of occurrences> }],
    "missing": [{ "keyword": "<keyword>", "importance": "<High | Medium | Low>" }]
  },
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "..."]
}

For formatChecks, evaluate these aspects:
- File parsability (is text cleanly extractable)
- Simple single-column layout
- Standard section headers used
- Consistent date formatting
- No detected images/graphics references
- Contact information present
- Appropriate resume length
- Bullet point formatting

For keywordAnalysis, if a job description is provided, match against it. Otherwise, analyze for general industry keywords.

Provide 4-6 specific, actionable recommendations.`;

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

    // Ensure safe defaults
    const validated = {
      atsScore: analysisJson.atsScore ?? 0,
      formatChecks: Array.isArray(analysisJson.formatChecks) ? analysisJson.formatChecks : [],
      sectionDetection: Array.isArray(analysisJson.sectionDetection) ? analysisJson.sectionDetection : [],
      keywordAnalysis: {
        found: Array.isArray(analysisJson.keywordAnalysis?.found) ? analysisJson.keywordAnalysis.found : [],
        missing: Array.isArray(analysisJson.keywordAnalysis?.missing) ? analysisJson.keywordAnalysis.missing : [],
      },
      recommendations: Array.isArray(analysisJson.recommendations) ? analysisJson.recommendations : [],
    };

    return new Response(JSON.stringify(validated), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("ATS Check Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "ATS analysis failed." }),
      { status: 500 }
    );
  }
}
