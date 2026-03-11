import { useResumeStore } from "~/stores/useResumeStore";
import { Mail, Phone, MapPin, User } from "lucide-react";

export default function ResumePreview() {
    const { personalInfo, experience, education, skills } = useResumeStore(
        (s) => s.resumeData
    );

    const hasAnyContent =
        personalInfo.fullName ||
        experience.some((e) => e.company || e.role) ||
        education.some((e) => e.institution) ||
        skills.length > 0;

    if (!hasAnyContent) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">Your resume preview will appear here</p>
                    <p className="text-xs mt-1">Start filling in the editor or analyze a PDF</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Indigo accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />

            {/* A4-ratio container */}
            <div
                className="p-8 md:p-10 max-w-[680px] mx-auto"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                {/* Header — Avatar + Name/Contact */}
                <header className="mb-8">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        {personalInfo.profilePicture ? (
                            <img
                                src={personalInfo.profilePicture}
                                alt={personalInfo.fullName}
                                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 border border-indigo-200/50">
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: "#6366F1" }}
                                >
                                    {personalInfo.fullName
                                        ? personalInfo.fullName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .substring(0, 2)
                                            .toUpperCase()
                                        : "?"}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div
                                className="text-[22px] font-bold tracking-tight leading-tight"
                                style={{ color: "#111827" }}
                            >
                                {personalInfo.fullName || "Your Name"}
                            </div>
                            <div
                                className="text-sm font-medium mt-0.5"
                                style={{ color: "#6366F1" }}
                            >
                                {personalInfo.title || "Your Title"}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-500">
                                {personalInfo.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-indigo-400" />
                                        {personalInfo.email}
                                    </span>
                                )}
                                {personalInfo.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-indigo-400" />
                                        {personalInfo.phone}
                                    </span>
                                )}
                                {personalInfo.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-indigo-400" />
                                        {personalInfo.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Summary */}
                {personalInfo.summary && (
                    <section className="mb-7">
                        <div className="w-full h-px bg-gray-200 mb-4" />
                        <p
                            className="text-xs leading-[1.8] tracking-wide"
                            style={{ color: "#6B7280" }}
                        >
                            {personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 &&
                    experience.some((e) => e.company || e.role) && (
                        <section className="mb-7">
                            <div className="w-full h-px bg-gray-200 mb-4" />
                            <div className="flex items-center gap-2 mb-4">
                                <div
                                    className="w-[3px] h-3.5 rounded-full"
                                    style={{ backgroundColor: "#6366F1" }}
                                />
                                <div
                                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                                    style={{ color: "#6366F1" }}
                                >
                                    Experience
                                </div>
                            </div>
                            <div className="space-y-5">
                                {experience
                                    .filter((e) => e.company || e.role)
                                    .map((exp) => (
                                        <div key={exp.id}>
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <div
                                                    className="text-[13px] font-semibold"
                                                    style={{ color: "#111827" }}
                                                >
                                                    {exp.role || "Role"}
                                                </div>
                                                <span className="text-[10px] text-gray-400 shrink-0 ml-4 font-medium">
                                                    {exp.startDate}
                                                    {exp.startDate && exp.endDate && " — "}
                                                    {exp.endDate}
                                                </span>
                                            </div>
                                            <p
                                                className="text-[11px] mb-1.5 font-medium"
                                                style={{ color: "#9CA3AF" }}
                                            >
                                                {exp.company}
                                            </p>
                                            {exp.highlights.filter(Boolean).length > 0 && (
                                                <ul className="space-y-1 mt-1">
                                                    {exp.highlights.filter(Boolean).map((h, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-[11px] leading-relaxed pl-3 relative"
                                                            style={{ color: "#6B7280" }}
                                                        >
                                                            <span
                                                                className="absolute left-0"
                                                                style={{ color: "#C7D2FE" }}
                                                            >
                                                                •
                                                            </span>
                                                            {h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                {/* Education */}
                {education.length > 0 &&
                    education.some((e) => e.institution || e.degree) && (
                        <section className="mb-7">
                            <div className="w-full h-px bg-gray-200 mb-4" />
                            <div className="flex items-center gap-2 mb-4">
                                <div
                                    className="w-[3px] h-3.5 rounded-full"
                                    style={{ backgroundColor: "#6366F1" }}
                                />
                                <div
                                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                                    style={{ color: "#6366F1" }}
                                >
                                    Education
                                </div>
                            </div>
                            <div className="space-y-3">
                                {education
                                    .filter((e) => e.institution || e.degree)
                                    .map((edu) => (
                                        <div key={edu.id}>
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <div
                                                    className="text-[13px] font-semibold"
                                                    style={{ color: "#111827" }}
                                                >
                                                    {edu.degree}
                                                    {edu.degree && edu.field && " in "}
                                                    {edu.field}
                                                </div>
                                                <span className="text-[10px] text-gray-400 shrink-0 ml-4 font-medium">
                                                    {edu.startDate}
                                                    {edu.startDate && edu.endDate && " — "}
                                                    {edu.endDate}
                                                </span>
                                            </div>
                                            <p
                                                className="text-[11px]"
                                                style={{ color: "#9CA3AF" }}
                                            >
                                                {edu.institution}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <div className="w-full h-px bg-gray-200 mb-4" />
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                className="w-[3px] h-3.5 rounded-full"
                                style={{ backgroundColor: "#6366F1" }}
                            />
                            <div
                                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                                style={{ color: "#6366F1" }}
                            >
                                Skills
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill, i) => (
                                <span
                                    key={`${skill}-${i}`}
                                    className="px-2.5 py-1 rounded-md text-[10px] font-medium"
                                    style={{
                                        backgroundColor: "#EEF2FF",
                                        color: "#4338CA",
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
