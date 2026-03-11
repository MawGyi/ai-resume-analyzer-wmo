import { useState } from "react";
import {
    User,
    Briefcase,
    GraduationCap,
    Sparkles,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import SkillsForm from "./SkillsForm";

type Section = "personal" | "experience" | "education" | "skills";

const sections: {
    id: Section;
    label: string;
    icon: React.ElementType;
}[] = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Sparkles },
];

export default function ResumeEditor() {
    const [expanded, setExpanded] = useState<Set<Section>>(
        new Set(["personal", "experience", "education", "skills"])
    );

    const toggleSection = (section: Section) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const renderForm = (section: Section) => {
        switch (section) {
            case "personal":
                return <PersonalInfoForm />;
            case "experience":
                return <ExperienceForm />;
            case "education":
                return <EducationForm />;
            case "skills":
                return <SkillsForm />;
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sections.map(({ id, label, icon: Icon }) => (
                <div
                    key={id}
                    className="glass-card"
                    style={{ margin: 0, padding: 0, overflow: "hidden" }}
                >
                    <button
                        onClick={() => toggleSection(id)}
                        style={{
                            width: "100%",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ 
                                width: 32, 
                                height: 32, 
                                background: "var(--accent-blue-dim)", 
                                borderRadius: 8, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center" 
                            }}>
                                <Icon style={{ width: 16, height: 16, color: "var(--accent-blue)" }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                {label}
                            </span>
                        </div>
                        {expanded.has(id) ? (
                            <ChevronDown style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
                        ) : (
                            <ChevronRight style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
                        )}
                    </button>

                    {expanded.has(id) && (
                        <div style={{ 
                            padding: "4px 20px 20px", 
                            borderTop: "1px solid var(--border-subtle)" 
                        }}>
                            {renderForm(id)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
