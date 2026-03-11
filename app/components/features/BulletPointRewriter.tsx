import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

export default function BulletPointRewriter({
  aiProvider, customApiKey, customBaseUrl, customAiModel
}: {
  aiProvider: string, customApiKey: string, customBaseUrl: string, customAiModel: string
}) {
  const [bulletPoint, setBulletPoint] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRewrite = async () => {
    if (!bulletPoint.trim()) return;

    setIsLoading(true);
    setError("");
    setRewritten("");

    try {
      const res = await fetch("/api/features/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletPoint,
          targetKeywords,
          provider: aiProvider,
          customApiKey,
          customBaseUrl,
          customModel: customAiModel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to rewrite bullet point");
      }

      setRewritten(data.rewritten);
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
          <Sparkles style={{ width: 18, height: 18, color: "var(--accent-blue)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Bullet Point Rewriter</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Transform weak bullet points into strong, impact-driven statements.
        </p>
      </div>

      <div>
        <label className="dark-label">Original Bullet Point</label>
        <textarea
          value={bulletPoint}
          onChange={(e) => setBulletPoint(e.target.value)}
          placeholder="e.g. Helped with sales and marketing stuff..."
          className="dark-textarea"
          rows={3}
        />
      </div>

      <div>
        <label className="dark-label">
          Target Keywords
          <span className="dark-label-hint">(optional)</span>
        </label>
        <input
          type="text"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          placeholder="e.g. leadership, revenue growth, Agile"
          className="dark-input"
        />
      </div>

      <button
        onClick={handleRewrite}
        disabled={!bulletPoint.trim() || isLoading}
        className="btn-primary"
        style={{ justifyContent: "center", width: "100%", padding: "12px 16px" }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            Rewriting...
          </>
        ) : (
          "Rewrite Bullet Point"
        )}
      </button>

      {error && (
        <div className="error-toast">
          <span className="error-toast-text">{error}</span>
        </div>
      )}

      {rewritten && (
        <div className="glass-card animate-fade-in" style={{ margin: 0 }}>
          <div className="glass-card-title" style={{ color: "var(--accent-green)" }}>Rewritten Result</div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{rewritten}</p>
          <button
            onClick={() => navigator.clipboard.writeText(rewritten)}
            className="btn-accent-green"
            style={{ marginTop: 12 }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
