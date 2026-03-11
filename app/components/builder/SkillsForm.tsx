import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

export default function SkillsForm() {
    const { skills } = useResumeStore((s) => s.resumeData);
    const addSkill = useResumeStore((s) => s.addSkill);
    const removeSkill = useResumeStore((s) => s.removeSkill);
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = () => {
        const trimmed = newSkill.trim();
        if (trimmed && !skills.includes(trimmed)) {
            addSkill(trimmed);
            setNewSkill("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSkill();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="dark-input"
                    style={{ flex: 1 }}
                    placeholder="Type a skill and press Enter..."
                />
                <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                    className="btn-primary"
                    style={{ padding: "8px 16px" }}
                >
                    <Plus style={{ width: 16, height: 16 }} />
                    Add
                </button>
            </div>

            {/* Skills Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((skill, idx) => (
                    <span
                        key={`${skill}-${idx}`}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            background: "var(--accent-blue-dim)",
                            color: "var(--accent-blue)",
                            borderRadius: "var(--radius-md)",
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        {skill}
                        <button
                            onClick={() => removeSkill(idx)}
                            style={{
                                padding: 2,
                                borderRadius: "50%",
                                background: "transparent",
                                color: "var(--accent-blue)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            <X style={{ width: 12, height: 12 }} />
                        </button>
                    </span>
                ))}
            </div>

            {skills.length === 0 && (
                <p style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "16px 0"
                }}>
                    No skills added yet. Type above to add skills.
                </p>
            )}
        </div>
    );
}
