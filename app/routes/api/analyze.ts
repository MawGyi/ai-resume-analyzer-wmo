import { data } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, customApiKey, provider, customBaseUrl, customModel } = body;

    if (!resumeText || resumeText.trim().length === 0) {
      return data({ error: "Resume text is required." }, { status: 400 });
    }

    const isOpenAi = provider === "openai";
    const apiKey = customApiKey || (!isOpenAi ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);
    
    if (!apiKey) {
      console.error(`No API key provided for provider: ${provider}`);
      return data(
        { error: "AI service is not configured. Please provide your own API Key." },
        { status: 500 }
      );
    }

    const jdSection = jobDescription && jobDescription.trim().length > 0
      ? `\n\n--- JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---`
      : "\n\n(No specific job description was provided. Evaluate the resume on general quality.)";

    const prompt = `You are an expert resume analyst, ATS specialist, and recruitment strategist. Analyze the following resume thoroughly and provide a comprehensive structured evaluation.

--- RESUME ---
${resumeText}
--- END RESUME ---${jdSection}

Return your analysis as a valid JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "matchScore": <number 0-100>,
  "summary": "<one-sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>", "<area for improvement 3>"],
  "missingSkills": ["<missing skill 1>", "<missing skill 2>"],
  "experienceLevel": "<Junior | Mid-Level | Senior | Lead | Executive>",
  "overallVerdict": "<Strong Match | Good Potential | Needs Improvement | Not a Fit>",

  "sectionScores": {
    "experience": <number 0-100, quality/relevance of work experience section>,
    "skills": <number 0-100, skill alignment and depth>,
    "education": <number 0-100, relevance and level of education>,
    "format": <number 0-100, ATS-friendliness, readability, structure>,
    "summary": <number 0-100, quality of professional summary/objective>
  },

  "keywordMatches": [
    { "keyword": "<important keyword from JD or industry>", "found": true/false, "context": "<where it appears or why it's missing>" }
  ],

  "atsWarnings": [
    "<specific ATS format warning, e.g. 'Complex multi-column layout detected', 'Missing standard section headers', 'No dates found in experience section'>"
  ],

  "quantificationScore": <number 0-100, percentage of experience bullet points that include measurable metrics, numbers, or quantified results>,

  "actionVerbAnalysis": {
    "score": <number 0-100>,
    "strongVerbs": ["<strong action verb found>", "..."],
    "weakPhrases": ["<weak phrase that should be replaced>", "..."]
  }
}

Include 6-10 keyword matches. For atsWarnings return an empty array if no issues found.

Scoring guidelines:
- 85-100: Exceptional match, strong experience and skills alignment
- 70-84: Good match, most requirements met
- 50-69: Moderate match, several gaps
- 0-49: Weak match, significant gaps

Be honest and constructive. Focus on actionable insights.`;

    // Ensure enriched analysis fields have safe defaults
    function validateAnalysis(raw: any) {
      return {
        matchScore: raw.matchScore ?? 0,
        summary: raw.summary ?? "",
        strengths: raw.strengths ?? [],
        improvements: raw.improvements ?? [],
        missingSkills: raw.missingSkills ?? [],
        experienceLevel: raw.experienceLevel ?? "Unknown",
        overallVerdict: raw.overallVerdict ?? "Needs Improvement",
        sectionScores: {
          experience: raw.sectionScores?.experience ?? 0,
          skills: raw.sectionScores?.skills ?? 0,
          education: raw.sectionScores?.education ?? 0,
          format: raw.sectionScores?.format ?? 0,
          summary: raw.sectionScores?.summary ?? 0,
        },
        keywordMatches: Array.isArray(raw.keywordMatches) ? raw.keywordMatches : [],
        atsWarnings: Array.isArray(raw.atsWarnings) ? raw.atsWarnings : [],
        quantificationScore: raw.quantificationScore ?? 0,
        actionVerbAnalysis: {
          score: raw.actionVerbAnalysis?.score ?? 0,
          strongVerbs: raw.actionVerbAnalysis?.strongVerbs ?? [],
          weakPhrases: raw.actionVerbAnalysis?.weakPhrases ?? [],
        },
      };
    }

    let analysisJson;

    // ----- OPENAI COMPATIBLE PROVIDER -----
    if (isOpenAi) {
      try {
        const modelToUse = customModel || "gpt-4o-mini";
        console.log(`[OpenAI] Attempting using base URL: ${customBaseUrl || 'default'} and model: ${modelToUse}`);
        const openai = new OpenAI({
          apiKey,
          baseURL: customBaseUrl || undefined,
        });

        const response = await openai.chat.completions.create({
          model: modelToUse,
          messages: [{ role: "user", content: prompt }],
        });

        const responseText = response.choices[0]?.message?.content || "{}";
        
        try {
          analysisJson = JSON.parse(responseText);
        } catch {
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            try { analysisJson = JSON.parse(jsonMatch[1].trim()); } catch { /* ignore */ }
          }
          if (!analysisJson) {
            const objectMatch = responseText.match(/\{[\s\S]*\}/);
            if (objectMatch) {
              try { analysisJson = JSON.parse(objectMatch[0]); } catch { /* ignore */ }
            }
          }
          if (!analysisJson) {
            throw new Error("Could not parse AI response as JSON");
          }
        }
        
        return data({ analysis: validateAnalysis(analysisJson) });
      } catch (err: any) {
        console.error("[OpenAI] Error:", err.message, err.status, err);
        const status = err.status || 500;
        let errorMessage = "AI analysis failed. Please try again.";
        
        // Log precise fallback errors
        if (status === 401) {
          errorMessage = "Unauthorized or Invalid API Key. ";
          if (err.message) errorMessage += `Details: ${err.message}`;
        } else if (status === 429) {
          errorMessage = "API rate limit reached or out of credits. Please check your provider quota.";
        } else if (status === 404) {
          errorMessage = `Invalid Base URL or Model. Details: ${err.message || "Model not found."}`;
        } else if (err.message) {
          errorMessage = `API Error: ${err.message}`;
        }
        
        return data({ error: errorMessage }, { status });
      }
    }

    // ----- GOOGLE GEMINI PROVIDER -----
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const modelName = attempt < 2 ? MODELS[0] : MODELS[1];
      try {
        console.log(`[Gemini] Attempt ${attempt + 1}/${MAX_RETRIES} using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON from the response
        try {
          analysisJson = JSON.parse(responseText);
        } catch {
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            analysisJson = JSON.parse(jsonMatch[1].trim());
          } else {
            const objectMatch = responseText.match(/\{[\s\S]*\}/);
            if (objectMatch) {
              analysisJson = JSON.parse(objectMatch[0]);
            } else {
              throw new Error("Could not parse AI response as JSON");
            }
          }
        }

        return data({ analysis: validateAnalysis(analysisJson) });
      } catch (err: any) {
        lastError = err;
        console.error(`[Gemini] Attempt ${attempt + 1} failed:`, err?.status || err?.message);

        if (err?.status === 429 && attempt < MAX_RETRIES - 1) {
          const waitMs = Math.pow(2, attempt + 1) * 5000; // 10s, 20s
          console.log(`[Gemini] Rate limited. Waiting ${waitMs / 1000}s before retry...`);
          await sleep(waitMs);
          continue;
        }

        if (err?.status !== 429) break; // Don't retry non-rate-limit errors
      }
    }

    // All retries failed (Gemini)
    console.error("Gemini Analysis Error (all retries exhausted):", lastError);

    if (lastError?.message?.includes("API_KEY")) {
      const errorMsg = customApiKey 
        ? "Invalid Custom API Key. Please check the key you provided." 
        : "Invalid API key. Please check your GEMINI_API_KEY.";
      return data({ error: errorMsg }, { status: 401 });
    }

    if (lastError?.status === 429) {
      return data(
        { error: "API rate limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return data(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Analysis Endpoint Error:", error);
    return data(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

