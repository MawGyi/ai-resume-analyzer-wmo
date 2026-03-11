import { useState } from "react";
import { Wand2, Loader2, CheckCircle, Plus, ArrowRight, Lightbulb, Target } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

interface BulletRewrite {
  original: string;
  suggested: string;
  reason: string;
}

interface KeywordInjection {
  keyword: string;
  suggestedPlacement: string;
}

interface TailorResult {
  tailoredSummary: string;
  bulletRewrites: BulletRewrite[];
  skillsToAdd: string[];
  skillsToReorder: string[];
  keywordsToInject: KeywordInjection[];
  overallStrategy: string;
}

export default function TailorSuggestions({
  resumeText,
  jobDescription,
  aiProvider,
  customApiKey,
  customBaseUrl,
  customAiModel,
}: {
  resumeText: string;
  jobDescription: string;
  aiProvider: string;
  customApiKey: string;
  customBaseUrl: string;
  customAiModel: string;
}) {
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedItems, setAcceptedItems] = useState<Set<string>>(new Set());

  const setPersonalInfo = useResumeStore((s) => s.setPersonalInfo);
  const addSkill = useResumeStore((s) => s.addSkill);
  const resumeData = useResumeStore((s) => s.resumeData);

  const handleTailor = async () => {
    if (!resumeText || !jobDescription) return;

    setIsLoading(true);
    setError("");
    setResult(null);
    setAcceptedItems(new Set());

    try {
      const res = await fetch("/api/features/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          provider: aiProvider,
          customApiKey,
          customBaseUrl,
          customModel: customAiModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tailoring failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markAccepted = (key: string) => {
    setAcceptedItems((prev) => new Set(prev).add(key));
  };

  const handleAcceptSummary = () => {
    if (result?.tailoredSummary) {
      setPersonalInfo({ summary: result.tailoredSummary });
      markAccepted("summary");
    }
  };

  const handleAcceptSkill = (skill: string) => {
    if (!resumeData.skills.includes(skill)) {
      addSkill(skill);
    }
    markAccepted(`skill-${skill}`);
  };

  const handleAcceptAllSkills = () => {
    result?.skillsToAdd.forEach((skill) => {
      if (!resumeData.skills.includes(skill)) addSkill(skill);
      markAccepted(`skill-${skill}`);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Wand2 style={{ width: 18, height: 18, color: "var(--accent-purple)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>1-Click Resume Tailoring</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Get AI-powered suggestions to tailor your resume for a specific job. Accept individual changes or apply all at once.
        </p>
      </div>

      {(!resumeText || !jobDescription) && (
        <div className="badge badge-amber" style={{ padding: "10px 14px", fontSize: 13, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 8 }}>
          <Lightbulb style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!resumeText
            ? "Please upload a resume first."
            : "Please provide a job description in the left panel for tailored suggestions."}
        </div>
      )}

      {resumeText && jobDescription && !result && (
        <button
          onClick={handleTailor}
          disabled={isLoading}
          className="btn-primary"
          style={{ justifyContent: "center", width: "100%", padding: "12px 16px" }}
        >
          {isLoading ? (
            <>
              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              Generating Tailoring Suggestions...
            </>
          ) : (
            <>
              <Wand2 style={{ width: 14, height: 14 }} />
              Tailor My Resume
            </>
          )}
        </button>
      )}

      {error && (
        <div className="error-toast">
          <span className="error-toast-text">{error}</span>
        </div>
      )}

      {result && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Overall Strategy */}
          {result.overallStrategy && (
            <div className="glass-card" style={{ margin: 0, borderColor: "rgba(139, 92, 246, 0.2)" }}>
              <div style={{ fontWeight: 600, color: "var(--accent-purple)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <Target style={{ width: 14, height: 14 }} />
                Tailoring Strategy
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {result.overallStrategy}
              </p>
            </div>
          )}

          {/* Tailored Summary */}
          {result.tailoredSummary && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                  Suggested Summary
                </div>
                <button
                  onClick={handleAcceptSummary}
                  disabled={acceptedItems.has("summary")}
                  className={acceptedItems.has("summary") ? "btn-accent-green" : "btn-secondary"}
                  style={{ fontSize: 12, padding: "4px 12px" }}
                >
                  {acceptedItems.has("summary") ? (
                    <><CheckCircle style={{ width: 12, height: 12 }} /> Applied</>
                  ) : (
                    <>Accept</>
                  )}
                </button>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{result.tailoredSummary}"
              </p>
            </div>
          )}

          {/* Bullet Rewrites */}
          {result.bulletRewrites.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                Bullet Point Rewrites
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.bulletRewrites.map((br, i) => (
                  <div key={i} style={{ borderBottom: i < result.bulletRewrites.length - 1 ? "1px solid var(--border-subtle)" : "none", paddingBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                      <span style={{ textDecoration: "line-through" }}>{br.original}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--accent-green)", fontWeight: 500, marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <ArrowRight style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                      {br.suggested}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                      Why: {br.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Add */}
          {result.skillsToAdd.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                  Skills to Add
                </div>
                <button onClick={handleAcceptAllSkills} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
                  <Plus style={{ width: 11, height: 11 }} /> Add All
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.skillsToAdd.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => handleAcceptSkill(skill)}
                    disabled={acceptedItems.has(`skill-${skill}`)}
                    className={acceptedItems.has(`skill-${skill}`) ? "badge badge-green" : "badge badge-blue"}
                    style={{ cursor: acceptedItems.has(`skill-${skill}`) ? "default" : "pointer", fontSize: 12, padding: "5px 12px", border: "none" }}
                  >
                    {acceptedItems.has(`skill-${skill}`) ? (
                      <><CheckCircle style={{ width: 11, height: 11, marginRight: 4 }} />{skill}</>
                    ) : (
                      <><Plus style={{ width: 11, height: 11, marginRight: 4 }} />{skill}</>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keywords to Inject */}
          {result.keywordsToInject.length > 0 && (
            <div className="glass-card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, fontSize: 14 }}>
                Keywords to Inject
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.keywordsToInject.map((kw, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
                    <span className="badge badge-muted" style={{ fontSize: 12, padding: "3px 10px", flexShrink: 0 }}>
                      {kw.keyword}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{kw.suggestedPlacement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Re-run button */}
          <button
            onClick={handleTailor}
            disabled={isLoading}
            className="btn-secondary"
            style={{ justifyContent: "center", width: "100%", padding: "10px 16px" }}
          >
            {isLoading ? (
              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            ) : (
              <Wand2 style={{ width: 14, height: 14 }} />
            )}
            Re-generate Suggestions
          </button>
        </div>
      )}
    </div>
  );
}
