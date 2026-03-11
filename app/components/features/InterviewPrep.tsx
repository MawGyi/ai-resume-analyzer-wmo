import { useState } from "react";
import { MessageSquare, Loader2, Lightbulb, Target } from "lucide-react";

export default function InterviewPrep({
  resumeText, jobDescription, aiProvider, customApiKey, customBaseUrl, customAiModel
}: {
  resumeText: string, jobDescription: string, aiProvider: string, customApiKey: string, customBaseUrl: string, customAiModel: string
}) {
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<Array<{question: string, rationale: string, hints: string[]}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!resumeText) {
      setError("Please upload a resume first to generate personalized interview questions.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/features/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          difficulty,
          provider: aiProvider,
          customApiKey,
          customBaseUrl,
          customModel: customAiModel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate interview questions");
      }

      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <MessageSquare style={{ width: 18, height: 18, color: "var(--accent-blue)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Interview Q's Generator</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Get custom interview questions tailored specifically to your resume experience and the target job description.
        </p>
      </div>

      {!resumeText && (
        <div className="badge badge-amber" style={{ padding: "10px 14px", fontSize: 13, borderRadius: "var(--radius-md)" }}>
          Please upload a resume on the left panel first.
        </div>
      )}

      <div>
        <label className="dark-label">Interview Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="dark-select"
        >
          <option value="easy">Easy (Behavioral Focus)</option>
          <option value="medium">Medium (Standard Technical + Behavioral)</option>
          <option value="hard">Hard (Deep Dives & Edge Cases)</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!resumeText || isLoading}
        className="btn-primary"
        style={{ justifyContent: "center", width: "100%", padding: "12px 16px" }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            Generating Questions...
          </>
        ) : (
          "Generate Interview Questions"
        )}
      </button>

      {error && (
        <div className="error-toast">
          <span className="error-toast-text">{error}</span>
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" }}>
            Custom Practice Questions
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--accent-blue)", marginBottom: 8, fontSize: 14, display: "flex", alignItems: "flex-start", gap: 6 }}>
                <Target style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                Q{idx + 1}: {q.question}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Why they ask this: </span>
                {q.rationale}
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <Lightbulb style={{ width: 12, height: 12, color: "var(--accent-amber)" }} />
                  How to answer:
                </span>
                <ul style={{ paddingLeft: 20, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 4 }}>
                  {q.hints.map((hint, hIdx) => (
                    <li key={hIdx} style={{ color: "var(--text-tertiary)", lineHeight: 1.5 }}>{hint}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
