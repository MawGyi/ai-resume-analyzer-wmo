import { useState } from "react";
import { useResumeStore } from "~/stores/useResumeStore";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { Sparkles, Loader2, CheckCircle, X } from "lucide-react";

export default function PersonalInfoForm() {
    const resumeData = useResumeStore((s) => s.resumeData);
    const { personalInfo } = resumeData;
    const setPersonalInfo = useResumeStore((s) => s.setPersonalInfo);

    const [aiSummary, setAiSummary] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setAiSummary("");
        try {
            const provider = localStorage.getItem("customAiProvider") || "gemini";
            const apiKey = localStorage.getItem("customAiApiKey") || "";
            const baseUrl = localStorage.getItem("customAiBaseUrl") || "";
            const model = localStorage.getItem("customAiModel") || "";

            const res = await fetch("/api/features/generate-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData,
                    provider,
                    customApiKey: apiKey,
                    customBaseUrl: baseUrl,
                    customModel: model,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAiSummary(data.summary);
        } catch {
            setAiSummary("");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
            {/* Profile Picture */}
            <ProfilePictureUpload />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label className="dark-label" style={{ marginBottom: 6 }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ fullName: e.target.value })}
                        className="dark-input"
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <label className="dark-label" style={{ marginBottom: 6 }}>
                        Job Title
                    </label>
                    <input
                        type="text"
                        value={personalInfo.title}
                        onChange={(e) => setPersonalInfo({ title: e.target.value })}
                        className="dark-input"
                        placeholder="Senior Software Engineer"
                    />
                </div>

                <div>
                    <label className="dark-label" style={{ marginBottom: 6 }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ email: e.target.value })}
                        className="dark-input"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="dark-label" style={{ marginBottom: 6 }}>
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ phone: e.target.value })}
                        className="dark-input"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <label className="dark-label" style={{ marginBottom: 6 }}>
                        Location
                    </label>
                    <input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ location: e.target.value })}
                        className="dark-input"
                        placeholder="San Francisco, CA"
                    />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label className="dark-label" style={{ margin: 0 }}>
                            Professional Summary
                        </label>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                            style={{
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 11, fontWeight: 600, padding: "3px 8px",
                                borderRadius: 6, border: "none", cursor: "pointer",
                                color: "var(--accent-purple)", background: "rgba(139, 92, 246, 0.1)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isGenerating ? (
                                <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                            ) : (
                                <Sparkles style={{ width: 12, height: 12 }} />
                            )}
                            {isGenerating ? "Generating..." : "AI Generate"}
                        </button>
                    </div>
                    <textarea
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({ summary: e.target.value })}
                        rows={4}
                        className="dark-textarea"
                        placeholder="A brief professional summary..."
                    />
                    {aiSummary && (
                        <div style={{
                            marginTop: 8, padding: "10px 12px", borderRadius: "var(--radius-md)",
                            background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.15)",
                            display: "flex", alignItems: "flex-start", gap: 8,
                        }}>
                            <div style={{ flex: 1, fontSize: 12, color: "var(--accent-purple)", lineHeight: 1.5 }}>
                                {aiSummary}
                            </div>
                            <button
                                onClick={() => { setPersonalInfo({ summary: aiSummary }); setAiSummary(""); }}
                                title="Accept"
                                style={{ padding: 3, color: "var(--accent-green)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                            >
                                <CheckCircle style={{ width: 16, height: 16 }} />
                            </button>
                            <button
                                onClick={() => setAiSummary("")}
                                title="Dismiss"
                                style={{ padding: 3, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                            >
                                <X style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
