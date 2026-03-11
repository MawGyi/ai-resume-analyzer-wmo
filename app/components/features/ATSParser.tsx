import { useState } from "react";
import { Search, Info, Loader2, Shield, CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface FormatCheck {
  check: string;
  passed: boolean;
  detail: string;
}

interface SectionDetection {
  section: string;
  found: boolean;
  quality: string;
}

interface ATSReport {
  atsScore: number;
  formatChecks: FormatCheck[];
  sectionDetection: SectionDetection[];
  keywordAnalysis: {
    found: { keyword: string; count: number }[];
    missing: { keyword: string; importance: string }[];
  };
  recommendations: string[];
}

export default function ATSParser({
  resumeText,
  jobDescription,
  aiProvider,
  customApiKey,
  customBaseUrl,
  customAiModel,
}: {
  resumeText: string;
  jobDescription?: string;
  aiProvider?: string;
  customApiKey?: string;
  customBaseUrl?: string;
  customAiModel?: string;
}) {
  const [report, setReport] = useState<ATSReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRawText, setShowRawText] = useState(false);

  const handleRunCheck = async () => {
    if (!resumeText) return;

    setIsLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/features/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription || "",
          provider: aiProvider || "gemini",
          customApiKey: customApiKey || "",
          customBaseUrl: customBaseUrl || "",
          customModel: customAiModel || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ATS check failed");
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "var(--accent-green)" : score >= 60 ? "var(--accent-amber)" : "var(--accent-red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Search style={{ width: 18, height: 18, color: "var(--accent-blue)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>ATS Compatibility Checker</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Run a comprehensive ATS compatibility analysis with format checks, section detection, and keyword gap analysis.
        </p>
      </div>

      {!resumeText && (
        <div className="badge badge-amber" style={{ padding: "10px 14px", fontSize: 13, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 8 }}>
          <Info style={{ width: 16, height: 16, flexShrink: 0 }} />
          Please upload a resume on the left panel first to run the ATS check.
        </div>
      )}

      {resumeText && !report && (
        <button
          onClick={handleRunCheck}
          disabled={isLoading}
          className="btn-primary"
          style={{ justifyContent: "center", width: "100%", padding: "12px 16px" }}
        >
          {isLoading ? (
            <>
              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              Analyzing ATS Compatibility...
            </>
          ) : (
            <>
              <Shield style={{ width: 14, height: 14 }} />
              Run ATS Compatibility Check
            </>
          )}
        </button>
      )}

      {error && (
        <div className="error-toast">
          <span className="error-toast-text">{error}</span>
        </div>
      )}

      {report && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* ATS Score */}
          <div className="glass-card" style={{ margin: 0, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor(report.atsScore) }}>
              {report.atsScore}<span style={{ fontSize: 18, fontWeight: 400 }}>%</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>ATS Compatibility Score</div>
            <button
              onClick={handleRunCheck}
              disabled={isLoading}
              className="btn-secondary"
              style={{ marginTop: 12, fontSize: 12 }}
            >
              {isLoading ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : "Re-run Check"}
            </button>
          </div>

          {/* Format Checks */}
          {report.formatChecks.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                Format Checks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.formatChecks.map((fc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
                    {fc.passed ? (
                      <CheckCircle style={{ width: 16, height: 16, color: "var(--accent-green)", flexShrink: 0, marginTop: 1 }} />
                    ) : (
                      <XCircle style={{ width: 16, height: 16, color: "var(--accent-red)", flexShrink: 0, marginTop: 1 }} />
                    )}
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fc.check}</span>
                      <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{fc.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Detection */}
          {report.sectionDetection.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                Section Detection
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {report.sectionDetection.map((sd, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: "var(--radius-md)",
                    background: sd.found ? "rgba(16, 185, 129, 0.06)" : "rgba(239, 68, 68, 0.06)",
                    border: `1px solid ${sd.found ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                  }}>
                    {sd.found ? (
                      <CheckCircle style={{ width: 14, height: 14, color: "var(--accent-green)", flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle style={{ width: 14, height: 14, color: "var(--accent-red)", flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{sd.section}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sd.quality}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Analysis */}
          <div className="glass-card" style={{ margin: 0 }}>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
              Keyword Analysis
            </div>
            {report.keywordAnalysis.found.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-green)", marginBottom: 8 }}>
                  Found Keywords
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {report.keywordAnalysis.found.map((kw, i) => (
                    <span key={i} className="badge badge-green" style={{ fontSize: 12, padding: "4px 10px" }}>
                      {kw.keyword} {kw.count > 1 && <span style={{ opacity: 0.7 }}>×{kw.count}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.keywordAnalysis.missing.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-red)", marginBottom: 8 }}>
                  Missing Keywords
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {report.keywordAnalysis.missing.map((kw, i) => (
                    <span key={i} className="badge badge-red" style={{ fontSize: 12, padding: "4px 10px" }}>
                      {kw.keyword}
                      <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>{kw.importance}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                <Lightbulb style={{ width: 15, height: 15, color: "var(--accent-amber)" }} />
                Recommendations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--accent-amber)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Raw Text */}
          <div className="glass-card" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => setShowRawText(!showRawText)}
              style={{
                width: "100%", padding: "10px 16px", border: "none",
                background: "var(--bg-tertiary)", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
              }}
            >
              <span>Raw Extracted Text</span>
              <span style={{ fontSize: 10 }}>{showRawText ? "▲ Hide" : "▼ Show"}</span>
            </button>
            {showRawText && (
              <div style={{
                padding: 16, fontFamily: "'Geist Mono', monospace",
                fontSize: 12, color: "var(--text-secondary)",
                whiteSpace: "pre-wrap", lineHeight: 1.6,
                maxHeight: 300, overflowY: "auto",
                borderTop: "1px solid var(--border-subtle)",
              }}>
                {resumeText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
