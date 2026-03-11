import { useState } from "react";
import { Plus, Trash2, GripVertical, Sparkles, Loader2, CheckCircle, X } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

export default function ExperienceForm() {
    const { experience } = useResumeStore((s) => s.resumeData);
    const addExperience = useResumeStore((s) => s.addExperience);
    const updateExperience = useResumeStore((s) => s.updateExperience);
    const removeExperience = useResumeStore((s) => s.removeExperience);
    const addExperienceHighlight = useResumeStore(
        (s) => s.addExperienceHighlight
    );
    const updateExperienceHighlight = useResumeStore(
        (s) => s.updateExperienceHighlight
    );
    const removeExperienceHighlight = useResumeStore(
        (s) => s.removeExperienceHighlight
    );

    // AI rewrite state: key = "expId-hIdx", value = { loading, suggestion }
    const [rewriteStates, setRewriteStates] = useState<Record<string, { loading: boolean; suggestion: string }>>({});

    const handleAiRewrite = async (expId: string, hIdx: number, bulletText: string) => {
        if (!bulletText.trim()) return;
        const key = `${expId}-${hIdx}`;
        setRewriteStates((prev) => ({ ...prev, [key]: { loading: true, suggestion: "" } }));

        try {
            const provider = localStorage.getItem("customAiProvider") || "gemini";
            const apiKey = localStorage.getItem("customAiApiKey") || "";
            const baseUrl = localStorage.getItem("customAiBaseUrl") || "";
            const model = localStorage.getItem("customAiModel") || "";

            const res = await fetch("/api/features/rewrite-bullet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bulletPoint: bulletText,
                    targetKeywords: "",
                    provider,
                    customApiKey: apiKey,
                    customBaseUrl: baseUrl,
                    customModel: model,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRewriteStates((prev) => ({ ...prev, [key]: { loading: false, suggestion: data.rewritten } }));
        } catch {
            setRewriteStates((prev) => ({ ...prev, [key]: { loading: false, suggestion: "" } }));
        }
    };

    const acceptRewrite = (expId: string, hIdx: number) => {
        const key = `${expId}-${hIdx}`;
        const suggestion = rewriteStates[key]?.suggestion;
        if (suggestion) {
            updateExperienceHighlight(expId, hIdx, suggestion);
        }
        setRewriteStates((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const dismissRewrite = (expId: string, hIdx: number) => {
        const key = `${expId}-${hIdx}`;
        setRewriteStates((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
            {experience.map((exp, idx) => (
                <div
                    key={exp.id}
                    style={{
                        position: "relative",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                            <GripVertical style={{ width: 16, height: 16 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Experience {idx + 1}
                            </span>
                        </div>
                        {experience.length > 1 && (
                            <button
                                onClick={() => removeExperience(exp.id)}
                                style={{
                                    padding: 6,
                                    color: "var(--text-muted)",
                                    background: "transparent",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--accent-red)";
                                    e.currentTarget.style.background = "var(--accent-red-dim)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Company</label>
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                className="dark-input"
                                placeholder="Company name"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Role</label>
                            <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                                className="dark-input"
                                placeholder="Job title"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Start Date</label>
                            <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                className="dark-input"
                                placeholder="2022-01"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>End Date</label>
                            <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                className="dark-input"
                                placeholder="Present"
                            />
                        </div>
                    </div>

                    {/* Highlights */}
                    <div style={{ marginTop: 4 }}>
                        <label className="dark-label" style={{ marginBottom: 8 }}>Key Achievements</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {exp.highlights.map((highlight, hIdx) => {
                                const key = `${exp.id}-${hIdx}`;
                                const rState = rewriteStates[key];
                                return (
                                <div key={hIdx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ color: "var(--text-muted)", fontSize: 16 }}>•</span>
                                        <input
                                            type="text"
                                            value={highlight}
                                            onChange={(e) =>
                                                updateExperienceHighlight(exp.id, hIdx, e.target.value)
                                            }
                                            className="dark-input"
                                            style={{ flex: 1 }}
                                            placeholder="Describe an achievement..."
                                        />
                                        <button
                                            onClick={() => handleAiRewrite(exp.id, hIdx, highlight)}
                                            disabled={!highlight.trim() || rState?.loading}
                                            title="AI Rewrite"
                                            style={{
                                                padding: 5, color: rState?.loading ? "var(--text-muted)" : "var(--accent-purple)",
                                                background: "none", border: "none", cursor: highlight.trim() ? "pointer" : "default",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                borderRadius: 6, transition: "all 0.2s ease",
                                            }}
                                        >
                                            {rState?.loading ? (
                                                <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                            ) : (
                                                <Sparkles style={{ width: 14, height: 14 }} />
                                            )}
                                        </button>
                                        {exp.highlights.length > 1 && (
                                            <button
                                                onClick={() => removeExperienceHighlight(exp.id, hIdx)}
                                                style={{
                                                    padding: 4,
                                                    color: "var(--text-muted)",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-red)"}
                                                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                                            >
                                                <Trash2 style={{ width: 14, height: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                    {rState?.suggestion && (
                                        <div style={{
                                            marginLeft: 24, padding: "8px 12px", borderRadius: "var(--radius-md)",
                                            background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.15)",
                                            display: "flex", alignItems: "flex-start", gap: 8,
                                        }}>
                                            <div style={{ flex: 1, fontSize: 12, color: "var(--accent-purple)", lineHeight: 1.5 }}>
                                                {rState.suggestion}
                                            </div>
                                            <button
                                                onClick={() => acceptRewrite(exp.id, hIdx)}
                                                title="Accept"
                                                style={{ padding: 3, color: "var(--accent-green)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                                            >
                                                <CheckCircle style={{ width: 16, height: 16 }} />
                                            </button>
                                            <button
                                                onClick={() => dismissRewrite(exp.id, hIdx)}
                                                title="Dismiss"
                                                style={{ padding: 3, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                                            >
                                                <X style={{ width: 16, height: 16 }} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                            <button
                                onClick={() => addExperienceHighlight(exp.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: 12,
                                    color: "var(--accent-blue)",
                                    background: "none",
                                    border: "none",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    padding: 0,
                                    marginTop: 4
                                }}
                            >
                                <Plus style={{ width: 12, height: 12 }} />
                                Add achievement
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addExperience}
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px dashed var(--border-default)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-blue)";
                    e.currentTarget.style.color = "var(--accent-blue)";
                    e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <Plus style={{ width: 16, height: 16 }} />
                Add Experience
            </button>
        </div>
    );
}
