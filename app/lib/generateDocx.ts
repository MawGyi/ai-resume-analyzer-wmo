import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    BorderStyle,
    TabStopPosition,
    TabStopType,
    convertInchesToTwip,
} from "docx";
import type { ResumeData } from "~/types/resume";

const FONT = "Calibri";
const C = {
    indigo: "4F46E5",
    black: "111827",
    darkGray: "374151",
    gray: "6B7280",
    lightGray: "9CA3AF",
    bulletGray: "C7D2FE",
};

function createDivider(): Paragraph {
    return new Paragraph({
        border: {
            bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "E5E7EB",
                space: 1,
            },
        },
        spacing: { before: 200, after: 200 },
    });
}

function sectionHeading(text: string): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text: "  ",
                size: 16,
                font: FONT,
            }),
            new TextRun({
                text: text.toUpperCase(),
                bold: true,
                size: 16,
                font: FONT,
                color: C.indigo,
                characterSpacing: 80,
            }),
        ],
        border: {
            left: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: C.indigo,
                space: 4,
            },
        },
        spacing: { after: 140 },
    });
}

export function generateDocx(data: ResumeData): Document {
    const { personalInfo, experience, education, skills } = data;
    const sections: Paragraph[] = [];

    // ── Name ──
    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: personalInfo.fullName || "Your Name",
                    bold: true,
                    size: 36,
                    font: FONT,
                    color: C.black,
                }),
            ],
            spacing: { after: 40 },
        })
    );

    // ── Title ──
    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: personalInfo.title || "Your Title",
                    size: 20,
                    font: FONT,
                    color: C.indigo,
                }),
            ],
            spacing: { after: 100 },
        })
    );

    // ── Contact Line ──
    const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
    ].filter(Boolean);

    if (contactParts.length > 0) {
        sections.push(
            new Paragraph({
                children: contactParts.flatMap((part, i) => [
                    ...(i > 0
                        ? [
                            new TextRun({
                                text: "  •  ",
                                size: 16,
                                font: FONT,
                                color: C.lightGray,
                            }),
                        ]
                        : []),
                    new TextRun({
                        text: part,
                        size: 16,
                        font: FONT,
                        color: C.gray,
                    }),
                ]),
                spacing: { after: 60 },
            })
        );
    }

    // ── Summary ──
    if (personalInfo.summary) {
        sections.push(createDivider());
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: personalInfo.summary,
                        size: 18,
                        font: FONT,
                        color: C.gray,
                    }),
                ],
                spacing: { after: 60, lineRule: "auto", line: 360 },
            })
        );
    }

    // ── Experience ──
    const filledExp = experience.filter((e) => e.company || e.role);
    if (filledExp.length > 0) {
        sections.push(createDivider());
        sections.push(sectionHeading("Experience"));

        for (const exp of filledExp) {
            sections.push(
                new Paragraph({
                    tabStops: [
                        {
                            type: TabStopType.RIGHT,
                            position: TabStopPosition.MAX,
                        },
                    ],
                    children: [
                        new TextRun({
                            text: exp.role || "Role",
                            bold: true,
                            size: 20,
                            font: FONT,
                            color: C.black,
                        }),
                        new TextRun({ text: "\t" }),
                        new TextRun({
                            text: `${exp.startDate}${exp.startDate && exp.endDate ? " — " : ""}${exp.endDate}`,
                            size: 15,
                            font: FONT,
                            color: C.lightGray,
                        }),
                    ],
                    spacing: { after: 20 },
                })
            );

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: exp.company,
                            size: 18,
                            font: FONT,
                            color: C.lightGray,
                        }),
                    ],
                    spacing: { after: 60 },
                })
            );

            for (const h of exp.highlights.filter(Boolean)) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: h,
                                size: 18,
                                font: FONT,
                                color: C.gray,
                            }),
                        ],
                        bullet: { level: 0 },
                        spacing: { after: 30, lineRule: "auto", line: 320 },
                    })
                );
            }

            sections.push(
                new Paragraph({ spacing: { after: 100 }, children: [] })
            );
        }
    }

    // ── Education ──
    const filledEdu = education.filter((e) => e.institution || e.degree);
    if (filledEdu.length > 0) {
        sections.push(createDivider());
        sections.push(sectionHeading("Education"));

        for (const edu of filledEdu) {
            const degreeText = [edu.degree, edu.field]
                .filter(Boolean)
                .join(" in ");
            sections.push(
                new Paragraph({
                    tabStops: [
                        {
                            type: TabStopType.RIGHT,
                            position: TabStopPosition.MAX,
                        },
                    ],
                    children: [
                        new TextRun({
                            text: degreeText || "Degree",
                            bold: true,
                            size: 20,
                            font: FONT,
                            color: C.black,
                        }),
                        new TextRun({ text: "\t" }),
                        new TextRun({
                            text: `${edu.startDate}${edu.startDate && edu.endDate ? " — " : ""}${edu.endDate}`,
                            size: 15,
                            font: FONT,
                            color: C.lightGray,
                        }),
                    ],
                    spacing: { after: 20 },
                })
            );

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: edu.institution,
                            size: 18,
                            font: FONT,
                            color: C.lightGray,
                        }),
                    ],
                    spacing: { after: 80 },
                })
            );
        }
    }

    // ── Skills ──
    if (skills.length > 0) {
        sections.push(createDivider());
        sections.push(sectionHeading("Skills"));
        sections.push(
            new Paragraph({
                children: skills.flatMap((skill, i) => [
                    ...(i > 0
                        ? [
                            new TextRun({
                                text: "  •  ",
                                size: 16,
                                font: FONT,
                                color: C.bulletGray,
                            }),
                        ]
                        : []),
                    new TextRun({
                        text: skill,
                        size: 18,
                        font: FONT,
                        color: C.darkGray,
                    }),
                ]),
                spacing: { after: 60 },
            })
        );
    }

    return new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(0.7),
                            bottom: convertInchesToTwip(0.7),
                            left: convertInchesToTwip(0.8),
                            right: convertInchesToTwip(0.8),
                        },
                    },
                },
                children: sections,
            },
        ],
    });
}

export async function downloadDocx(data: ResumeData): Promise<void> {
    const doc = generateDocx(data);
    const blob = await Packer.toBlob(doc);
    const { saveAs } = await import("file-saver");
    saveAs(
        blob,
        `${data.personalInfo.fullName.replace(/\s+/g, "_") || "resume"}.docx`
    );
}
