import { create } from "zustand";
import type {
    ResumeData,
    PersonalInfo,
    ExperienceEntry,
    EducationEntry,
} from "~/types/resume";

function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

const emptyResumeData: ResumeData = {
    personalInfo: {
        fullName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
        profilePicture: undefined,
    },
    experience: [],
    education: [],
    skills: [],
};

interface ResumeStore {
    resumeData: ResumeData;
    isDataLoaded: boolean;
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    setProfilePicture: (dataUrl: string) => void;
    clearProfilePicture: () => void;
    addExperience: () => void;
    updateExperience: (id: string, data: Partial<ExperienceEntry>) => void;
    removeExperience: (id: string) => void;
    addExperienceHighlight: (expId: string) => void;
    updateExperienceHighlight: (
        expId: string,
        index: number,
        value: string
    ) => void;
    removeExperienceHighlight: (expId: string, index: number) => void;
    addEducation: () => void;
    updateEducation: (id: string, data: Partial<EducationEntry>) => void;
    removeEducation: (id: string) => void;
    setSkills: (skills: string[]) => void;
    addSkill: (skill: string) => void;
    removeSkill: (index: number) => void;
    loadResumeData: (data: ResumeData) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
    resumeData: emptyResumeData,
    isDataLoaded: false,

    setPersonalInfo: (info) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                personalInfo: { ...state.resumeData.personalInfo, ...info },
            },
        })),

    setProfilePicture: (dataUrl) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                personalInfo: {
                    ...state.resumeData.personalInfo,
                    profilePicture: dataUrl,
                },
            },
        })),

    clearProfilePicture: () =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                personalInfo: {
                    ...state.resumeData.personalInfo,
                    profilePicture: undefined,
                },
            },
        })),

    addExperience: () =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: [
                    ...state.resumeData.experience,
                    {
                        id: generateId(),
                        company: "",
                        role: "",
                        startDate: "",
                        endDate: "",
                        highlights: [""],
                    },
                ],
            },
        })),

    updateExperience: (id, data) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: state.resumeData.experience.map((exp) =>
                    exp.id === id ? { ...exp, ...data } : exp
                ),
            },
        })),

    removeExperience: (id) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: state.resumeData.experience.filter(
                    (exp) => exp.id !== id
                ),
            },
        })),

    addExperienceHighlight: (expId) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: state.resumeData.experience.map((exp) =>
                    exp.id === expId
                        ? { ...exp, highlights: [...exp.highlights, ""] }
                        : exp
                ),
            },
        })),

    updateExperienceHighlight: (expId, index, value) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: state.resumeData.experience.map((exp) =>
                    exp.id === expId
                        ? {
                            ...exp,
                            highlights: exp.highlights.map((h, i) =>
                                i === index ? value : h
                            ),
                        }
                        : exp
                ),
            },
        })),

    removeExperienceHighlight: (expId, index) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                experience: state.resumeData.experience.map((exp) =>
                    exp.id === expId
                        ? {
                            ...exp,
                            highlights: exp.highlights.filter((_, i) => i !== index),
                        }
                        : exp
                ),
            },
        })),

    addEducation: () =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                education: [
                    ...state.resumeData.education,
                    {
                        id: generateId(),
                        institution: "",
                        degree: "",
                        field: "",
                        startDate: "",
                        endDate: "",
                    },
                ],
            },
        })),

    updateEducation: (id, data) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                education: state.resumeData.education.map((edu) =>
                    edu.id === id ? { ...edu, ...data } : edu
                ),
            },
        })),

    removeEducation: (id) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                education: state.resumeData.education.filter(
                    (edu) => edu.id !== id
                ),
            },
        })),

    setSkills: (skills) =>
        set((state) => ({
            resumeData: { ...state.resumeData, skills },
        })),

    addSkill: (skill) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                skills: [...state.resumeData.skills, skill],
            },
        })),

    removeSkill: (index) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                skills: state.resumeData.skills.filter((_, i) => i !== index),
            },
        })),

    loadResumeData: (data) => set({ resumeData: data, isDataLoaded: true }),
}));
