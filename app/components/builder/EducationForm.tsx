import { Plus, Trash2, GripVertical } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

export default function EducationForm() {
    const { education } = useResumeStore((s) => s.resumeData);
    const addEducation = useResumeStore((s) => s.addEducation);
    const updateEducation = useResumeStore((s) => s.updateEducation);
    const removeEducation = useResumeStore((s) => s.removeEducation);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
            {education.map((edu, idx) => (
                <div
                    key={edu.id}
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
                                Education {idx + 1}
                            </span>
                        </div>
                        {education.length > 1 && (
                            <button
                                onClick={() => removeEducation(edu.id)}
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
                        <div style={{ gridColumn: "span 2" }}>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Institution</label>
                            <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                className="dark-input"
                                placeholder="University name"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Degree</label>
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                className="dark-input"
                                placeholder="Bachelor of Science"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Field of Study</label>
                            <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                                className="dark-input"
                                placeholder="Computer Science"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>Start Date</label>
                            <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                className="dark-input"
                                placeholder="2015-08"
                            />
                        </div>
                        <div>
                            <label className="dark-label" style={{ marginBottom: 4 }}>End Date</label>
                            <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                className="dark-input"
                                placeholder="2019-05"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addEducation}
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
                Add Education
            </button>
        </div>
    );
}
