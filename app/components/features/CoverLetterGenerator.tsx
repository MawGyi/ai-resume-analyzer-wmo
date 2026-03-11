import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

export default function CoverLetterGenerator({
  resumeText, jobDescription, aiProvider, customApiKey, customBaseUrl, customAiModel
}: {
  resumeText: string, jobDescription: string, aiProvider: string, customApiKey: string, customBaseUrl: string, customAiModel: string
}) {
  const [keyPoints, setKeyPoints] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!resumeText) {
      setError("Please upload a resume first to generate a cover letter.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/features/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          keyPoints,
          provider: aiProvider,
          customApiKey,
          customBaseUrl,
          customModel: customAiModel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setCoverLetter(data.coverLetter);
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
          <FileText style={{ width: 18, height: 18, color: "var(--accent-blue)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Cover Letter Generator</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Generate a highly tailored cover letter based on your uploaded resume and the job description.
        </p>
      </div>

      {!resumeText && (
        <div className="badge badge-amber" style={{ padding: "10px 14px", fontSize: 13, borderRadius: "var(--radius-md)" }}>
          Please upload a resume on the left panel first.
        </div>
      )}

      <div>
        <label className="dark-label">
          Key Points to Emphasize
          <span className="dark-label-hint">(optional)</span>
        </label>
        <textarea
          value={keyPoints}
          onChange={(e) => setKeyPoints(e.target.value)}
          placeholder="e.g. My leadership experience in Q4, my passion for AI development..."
          className="dark-textarea"
          rows={3}
        />
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
            Generating...
          </>
        ) : (
          "Generate Cover Letter"
        )}
      </button>

      {error && (
        <div className="error-toast">
          <span className="error-toast-text">{error}</span>
        </div>
      )}

      {coverLetter && (
        <div className="glass-card animate-fade-in" style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass-card-title">Generated Cover Letter</div>
          <textarea
            readOnly
            value={coverLetter}
            className="dark-textarea"
            style={{ minHeight: 300, resize: "none", cursor: "default" }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(coverLetter)}
            className="btn-accent-green"
            style={{ alignSelf: "flex-start" }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
