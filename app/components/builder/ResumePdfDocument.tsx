import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";
import type { ResumeData } from "~/types/resume";

// Register Inter font from Google Fonts
Font.register({
    family: "Inter",
    fonts: [
        {
            src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2",
            fontWeight: 400,
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2",
            fontWeight: 500,
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiA.woff2",
            fontWeight: 600,
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2",
            fontWeight: 700,
        },
    ],
});

const C = {
    indigo: "#4F46E5",
    indigoLight: "#EEF2FF",
    indigoText: "#4338CA",
    black: "#111827",
    darkGray: "#374151",
    gray: "#6B7280",
    lightGray: "#9CA3AF",
    border: "#E5E7EB",
    white: "#FFFFFF",
    bulletColor: "#C7D2FE",
};

const s = StyleSheet.create({
    page: {
        fontFamily: "Inter",
        fontSize: 10,
        color: C.darkGray,
        backgroundColor: C.white,
        paddingBottom: 40,
        paddingHorizontal: 40,
        paddingTop: 0,
    },
    // Accent bar
    accentBar: {
        height: 3,
        backgroundColor: C.indigo,
        marginBottom: 30,
        marginHorizontal: -40,
        width: "calc(100% + 80)",
    },
    // Header
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 20,
        marginTop: 30,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        objectFit: "cover",
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: C.indigoLight,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        fontSize: 16,
        fontWeight: 700,
        color: C.indigo,
    },
    headerContent: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 700,
        color: C.black,
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 10,
        fontWeight: 500,
        color: C.indigo,
        marginBottom: 5,
    },
    contactRow: {
        flexDirection: "row",
        gap: 14,
    },
    contactItem: {
        fontSize: 8,
        color: C.gray,
    },
    // Divider
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: C.border,
        marginTop: 14,
        marginBottom: 14,
    },
    // Section heading
    sectionHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    sectionAccent: {
        width: 3,
        height: 11,
        backgroundColor: C.indigo,
        borderRadius: 2,
    },
    sectionHeading: {
        fontSize: 8,
        fontWeight: 700,
        color: C.indigo,
        textTransform: "uppercase",
        letterSpacing: 2,
    },
    // Summary
    summaryText: {
        fontSize: 9,
        lineHeight: 1.7,
        color: C.gray,
        letterSpacing: 0.2,
    },
    // Experience
    expBlock: {
        marginBottom: 12,
    },
    expHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 2,
    },
    expRole: {
        fontSize: 10,
        fontWeight: 600,
        color: C.black,
    },
    expDates: {
        fontSize: 7.5,
        fontWeight: 500,
        color: C.lightGray,
    },
    expCompany: {
        fontSize: 9,
        fontWeight: 500,
        color: C.lightGray,
        marginBottom: 4,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 2,
        paddingLeft: 2,
    },
    bulletDot: {
        fontSize: 9,
        color: C.bulletColor,
        marginRight: 6,
        lineHeight: 1.5,
    },
    bulletText: {
        fontSize: 9,
        color: C.gray,
        lineHeight: 1.5,
        flex: 1,
    },
    // Education
    eduBlock: {
        marginBottom: 8,
    },
    eduDegree: {
        fontSize: 10,
        fontWeight: 600,
        color: C.black,
    },
    eduInstitution: {
        fontSize: 9,
        fontWeight: 500,
        color: C.lightGray,
    },
    // Skills
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    skillTag: {
        fontSize: 8,
        fontWeight: 500,
        color: C.indigoText,
        backgroundColor: C.indigoLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
});

interface Props {
    data: ResumeData;
}

export default function ResumePdfDocument({ data }: Props) {
    const { personalInfo, experience, education, skills } = data;

    const initials = personalInfo.fullName
        ? personalInfo.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "?";

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* Accent bar */}
                <View
                    style={{
                        height: 3,
                        backgroundColor: C.indigo,
                        marginHorizontal: -40,
                        marginBottom: 0,
                    }}
                    fixed
                />

                {/* Header */}
                <View style={s.headerRow}>
                    {personalInfo.profilePicture ? (
                        <Image src={personalInfo.profilePicture} style={s.avatar} />
                    ) : (
                        <View style={s.avatarPlaceholder}>
                            <Text style={s.avatarInitials}>{initials}</Text>
                        </View>
                    )}
                    <View style={s.headerContent}>
                        <Text style={s.name}>
                            {personalInfo.fullName || "Your Name"}
                        </Text>
                        <Text style={s.title}>
                            {personalInfo.title || "Your Title"}
                        </Text>
                        <View style={s.contactRow}>
                            {personalInfo.email && (
                                <Text style={s.contactItem}>✉ {personalInfo.email}</Text>
                            )}
                            {personalInfo.phone && (
                                <Text style={s.contactItem}>☎ {personalInfo.phone}</Text>
                            )}
                            {personalInfo.location && (
                                <Text style={s.contactItem}>📍 {personalInfo.location}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Summary */}
                {personalInfo.summary && (
                    <View>
                        <View style={s.divider} />
                        <Text style={s.summaryText}>{personalInfo.summary}</Text>
                    </View>
                )}

                {/* Experience */}
                {experience.length > 0 &&
                    experience.some((e) => e.company || e.role) && (
                        <View>
                            <View style={s.divider} />
                            <View style={s.sectionHeadingRow}>
                                <View style={s.sectionAccent} />
                                <Text style={s.sectionHeading}>Experience</Text>
                            </View>
                            {experience
                                .filter((e) => e.company || e.role)
                                .map((exp) => (
                                    <View key={exp.id} style={s.expBlock}>
                                        <View style={s.expHeader}>
                                            <Text style={s.expRole}>{exp.role || "Role"}</Text>
                                            <Text style={s.expDates}>
                                                {exp.startDate}
                                                {exp.startDate && exp.endDate ? " — " : ""}
                                                {exp.endDate}
                                            </Text>
                                        </View>
                                        <Text style={s.expCompany}>{exp.company}</Text>
                                        {exp.highlights.filter(Boolean).map((h, i) => (
                                            <View key={i} style={s.bulletItem}>
                                                <Text style={s.bulletDot}>•</Text>
                                                <Text style={s.bulletText}>{h}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                        </View>
                    )}

                {/* Education */}
                {education.length > 0 &&
                    education.some((e) => e.institution || e.degree) && (
                        <View>
                            <View style={s.divider} />
                            <View style={s.sectionHeadingRow}>
                                <View style={s.sectionAccent} />
                                <Text style={s.sectionHeading}>Education</Text>
                            </View>
                            {education
                                .filter((e) => e.institution || e.degree)
                                .map((edu) => (
                                    <View key={edu.id} style={s.eduBlock}>
                                        <View style={s.expHeader}>
                                            <Text style={s.eduDegree}>
                                                {edu.degree}
                                                {edu.degree && edu.field ? " in " : ""}
                                                {edu.field}
                                            </Text>
                                            <Text style={s.expDates}>
                                                {edu.startDate}
                                                {edu.startDate && edu.endDate ? " — " : ""}
                                                {edu.endDate}
                                            </Text>
                                        </View>
                                        <Text style={s.eduInstitution}>{edu.institution}</Text>
                                    </View>
                                ))}
                        </View>
                    )}

                {/* Skills */}
                {skills.length > 0 && (
                    <View>
                        <View style={s.divider} />
                        <View style={s.sectionHeadingRow}>
                            <View style={s.sectionAccent} />
                            <Text style={s.sectionHeading}>Skills</Text>
                        </View>
                        <View style={s.skillsContainer}>
                            {skills.map((skill, i) => (
                                <Text key={`${skill}-${i}`} style={s.skillTag}>
                                    {skill}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
}
