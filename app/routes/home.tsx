import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  XCircle,
  BriefcaseBusiness,
  Settings,
  Network,
  KeyRound,
  Cpu,
  Search,
  MessageSquare,
  Save,
  BarChart3,
  Hash,
  Zap,
  ShieldAlert,
  Wand2,
} from "lucide-react";
import ScoreChartComponent from "../components/ScoreChart";
import { useResumeStore } from "~/stores/useResumeStore";
import { useHistoryStore } from "~/stores/useHistoryStore";
import BulletPointRewriter from "~/components/features/BulletPointRewriter";
import CoverLetterGenerator from "~/components/features/CoverLetterGenerator";
import ATSParser from "~/components/features/ATSParser";
import InterviewPrep from "~/components/features/InterviewPrep";
import TailorSuggestions from "~/components/features/TailorSuggestions";
import { Link } from "react-router";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

interface KeywordMatch {
  keyword: string;
  found: boolean;
  context: string;
}

interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingSkills: string[];
  experienceLevel: string;
  overallVerdict: string;
  sectionScores: {
    experience: number;
    skills: number;
    education: number;
    format: number;
    summary: number;
  };
  keywordMatches: KeywordMatch[];
  atsWarnings: string[];
  quantificationScore: number;
  actionVerbAnalysis: {
    score: number;
    strongVerbs: string[];
    weakPhrases: string[];
  };
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customAiModel, setCustomAiModel] = useState("");
  const loadResumeData = useResumeStore((s) => s.loadResumeData);
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  // Initialize custom config from local storage
  useEffect(() => {
    const savedKey = localStorage.getItem("customAiApiKey");
    if (savedKey) setCustomApiKey(savedKey);

    const savedProvider = localStorage.getItem("customAiProvider") as "gemini" | "openai";
    if (savedProvider) setAiProvider(savedProvider);

    const savedBaseUrl = localStorage.getItem("customAiBaseUrl");
    if (savedBaseUrl) setCustomBaseUrl(savedBaseUrl);

    const savedModel = localStorage.getItem("customAiModel");
    if (savedModel) setCustomAiModel(savedModel);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomApiKey(e.target.value);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAiProvider(e.target.value as "gemini" | "openai");
  };

  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBaseUrl(e.target.value);
  };

  const handleAiModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAiModel(e.target.value);
  };

  const handleSaveConfig = () => {
    localStorage.setItem("customAiProvider", aiProvider);

    if (customApiKey) localStorage.setItem("customAiApiKey", customApiKey.trim());
    else localStorage.removeItem("customAiApiKey");

    if (customBaseUrl) localStorage.setItem("customAiBaseUrl", customBaseUrl.trim());
    else localStorage.removeItem("customAiBaseUrl");

    if (customAiModel) localStorage.setItem("customAiModel", customAiModel.trim());
    else localStorage.removeItem("customAiModel");

    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 3000);
  };

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResumeText("");
      setAnalysis(null);
      setErrorMessage("");
    }
  };

  const parseAndLoadResumeData = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    const fullName = lines[0] || "";
    const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : "";
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
    const phone = phoneMatch ? phoneMatch[1].trim() : "";

    const skillKeywords = [
      "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js",
      "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
      "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure", "GCP",
      "Docker", "Kubernetes", "Git", "GraphQL", "REST", "HTML", "CSS",
      "Tailwind", "Sass", "Next.js", "Express", "Django", "Flask",
      "Spring", "Ruby", "PHP", "Figma", "Linux", "CI/CD",
    ];
    const foundSkills = skillKeywords.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    loadResumeData({
      personalInfo: {
        fullName,
        title: lines[1] || "",
        email,
        phone,
        location: "",
        summary: "",
      },
      experience: [
        {
          id: generateId(),
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          highlights: [""],
        },
      ],
      education: [
        {
          id: generateId(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        },
      ],
      skills: foundSkills.length > 0 ? foundSkills : [],
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysis(null);

    try {
      setStatusMessage("Parsing resume file...");
      const formData = new FormData();
      formData.append("resume", file);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();

      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to parse resume file.");
      }

      setResumeText(parseData.text);
      parseAndLoadResumeData(parseData.text);

      setStatusMessage("Analyzing with AI...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: parseData.text,
          jobDescription,
          provider: aiProvider,
          customApiKey: customApiKey.trim(),
          customBaseUrl: customBaseUrl.trim(),
          customModel: customAiModel.trim(),
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || "AI analysis failed.");
      }

      setAnalysis(analyzeData.analysis);
      // Auto-save to history
      try {
        useHistoryStore.getState().addEntry({
          fileName: file?.name || "Unknown",
          jobTitle: jobDescription.slice(0, 80) || "General Analysis",
          matchScore: analyzeData.analysis.matchScore,
          overallVerdict: analyzeData.analysis.overallVerdict,
          sectionScores: analyzeData.analysis.sectionScores,
          quantificationScore: analyzeData.analysis.quantificationScore,
          actionVerbScore: analyzeData.analysis.actionVerbAnalysis?.score,
        });
      } catch { /* ignore history save errors */ }
      setStatusMessage("");
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      setStatusMessage("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Strong Match": return "badge-green";
      case "Good Potential": return "badge-blue";
      case "Needs Improvement": return "badge-amber";
      case "Not a Fit": return "badge-red";
      default: return "badge-muted";
    }
  };

  const tabs = [
    { id: "analysis", label: "Resume Analysis", icon: CheckCircle },
    { id: "bullet-rewriter", label: "Bullet Rewriter", icon: Sparkles },
    { id: "cover-letter", label: "Cover Letter", icon: FileText },
    { id: "ats-parser", label: "ATS Checker", icon: Search },
    { id: "tailor", label: "Tailor Resume", icon: Wand2 },
    { id: "interview-prep", label: "Interview Q's", icon: MessageSquare },
  ];

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 56px)" }}>

      {/* ── Left Panel: Upload & Config ── */}
      <div style={{
        width: 400,
        minWidth: 360,
        borderRight: "1px solid var(--border-subtle)",
        padding: 24,
        overflowY: "auto",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {/* Upload Area */}
        <div>
          <label className="dark-label" style={{ marginBottom: 10 }}>
            <Upload style={{ width: 16, height: 16 }} />
            Upload Resume
          </label>
          <div style={{
            border: "2px dashed var(--border-strong)",
            borderRadius: "var(--radius-lg)",
            padding: "32px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--glass-bg)",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
          }}>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            {file ? (
              <div style={{ textAlign: "center" }}>
                <FileText style={{ width: 36, height: 36, color: "var(--accent-blue)", marginBottom: 8 }} />
                <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{file.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Upload style={{ width: 36, height: 36, color: "var(--text-muted)", marginBottom: 8 }} />
                <p style={{ fontWeight: 500, color: "var(--text-secondary)", fontSize: 13 }}>Drag & Drop or Click</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF or DOCX (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="dark-label">
            <BriefcaseBusiness style={{ width: 14, height: 14 }} />
            Job Description
            <span className="dark-label-hint">(optional)</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for a tailored match score..."
            rows={4}
            className="dark-textarea"
          />
        </div>

        {/* AI Configuration */}
        <div className="glass-card" style={{ margin: 0 }}>
          <div className="glass-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Settings style={{ width: 12, height: 12 }} />
            AI Configuration
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Provider */}
            <div>
              <label className="dark-label" style={{ fontSize: 11 }}>AI Provider</label>
              <select
                value={aiProvider}
                onChange={handleProviderChange}
                className="dark-select"
              >
                <option value="gemini">Google Gemini (Default)</option>
                <option value="openai">OpenAI Compatible</option>
              </select>
            </div>

            {/* OpenAI-specific fields */}
            {aiProvider === "openai" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="dark-label" style={{ fontSize: 11 }}>
                    <Network style={{ width: 12, height: 12 }} />
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={customBaseUrl}
                    onChange={handleBaseUrlChange}
                    placeholder="e.g. https://opencode.ai/zen/v1"
                    className="dark-input"
                  />
                </div>
                <div>
                  <label className="dark-label" style={{ fontSize: 11 }}>
                    <Cpu style={{ width: 12, height: 12 }} />
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={customAiModel}
                    onChange={handleAiModelChange}
                    placeholder="e.g. gpt-4o-mini"
                    className="dark-input"
                  />
                </div>
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="dark-label" style={{ fontSize: 11 }}>
                <KeyRound style={{ width: 12, height: 12 }} />
                API Key
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={handleApiKeyChange}
                placeholder={`Paste your ${aiProvider === "gemini" ? "Gemini" : "OpenAI-compatible"} API key...`}
                className="dark-input"
              />
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                Keys are stored locally in your browser and never saved on our servers.
              </p>
            </div>

            {/* Save Config */}
            <button
              onClick={handleSaveConfig}
              className={isConfigSaved ? "btn-accent-green" : "btn-secondary"}
              style={{ justifyContent: "center", width: "100%", padding: "10px 16px" }}
            >
              {isConfigSaved ? (
                <>
                  <CheckCircle style={{ width: 14, height: 14 }} />
                  Configuration Saved!
                </>
              ) : (
                <>
                  <Save style={{ width: 14, height: 14 }} />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isAnalyzing}
          className="btn-primary"
          style={{
            justifyContent: "center",
            width: "100%",
            padding: "12px 16px",
            fontSize: 14,
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
              {statusMessage || "Analyzing..."}
            </>
          ) : (
            <>
              <Sparkles style={{ width: 16, height: 16 }} />
              Analyze Resume
            </>
          )}
        </button>
      </div>

      {/* ── Right Panel: Results & Tools ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Error Toast */}
        {errorMessage && (
          <div className="error-toast" style={{ margin: "16px 24px 0" }}>
            <XCircle style={{ width: 16, height: 16, color: "var(--accent-red)", flexShrink: 0 }} />
            <span className="error-toast-text">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="error-toast-close">
              <XCircle style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="dark-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`dark-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon style={{ width: 14, height: 14 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {activeTab === "analysis" && (
            <>
              {analysis !== null ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="animate-fade-in">
                  <ScoreChartComponent score={analysis.matchScore} />

                  {/* Verdict Badge */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span className={`badge ${verdictBadge(analysis.overallVerdict)}`} style={{ padding: "6px 16px", fontSize: 13 }}>
                      {analysis.overallVerdict} • {analysis.experienceLevel}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="glass-card" style={{ margin: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                      "{analysis.summary}"
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="glass-card" style={{ margin: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                      <CheckCircle style={{ width: 16, height: 16, color: "var(--accent-green)" }} />
                      Strengths
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {analysis.strengths.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent-green)", marginTop: 1 }}>✓</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div className="glass-card" style={{ margin: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                      <AlertTriangle style={{ width: 16, height: 16, color: "var(--accent-amber)" }} />
                      Areas to Improve
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {analysis.improvements.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent-amber)", marginTop: 1 }}>!</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {analysis.missingSkills.length > 0 && (
                    <div className="glass-card" style={{ margin: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <XCircle style={{ width: 16, height: 16, color: "var(--accent-red)" }} />
                        Missing Skills
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.missingSkills.map((skill, i) => (
                          <span key={i} className="badge badge-red" style={{ fontSize: 12, padding: "4px 12px" }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Breakdown */}
                  {analysis.sectionScores && (
                    <div className="glass-card" style={{ margin: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <BarChart3 style={{ width: 16, height: 16, color: "var(--accent-blue)" }} />
                        Section Breakdown
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {([
                          { label: "Experience", value: analysis.sectionScores.experience },
                          { label: "Skills", value: analysis.sectionScores.skills },
                          { label: "Education", value: analysis.sectionScores.education },
                          { label: "Format & ATS", value: analysis.sectionScores.format },
                          { label: "Summary", value: analysis.sectionScores.summary },
                        ] as const).map((s, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                              <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                              <span style={{ color: s.value >= 70 ? "var(--accent-green)" : s.value >= 50 ? "var(--accent-amber)" : "var(--accent-red)", fontWeight: 600 }}>{s.value}%</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)", overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${s.value}%`,
                                borderRadius: 3,
                                background: s.value >= 70 ? "var(--accent-green)" : s.value >= 50 ? "var(--accent-amber)" : "var(--accent-red)",
                                transition: "width 0.8s ease",
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keyword Matches */}
                  {analysis.keywordMatches && analysis.keywordMatches.length > 0 && (
                    <div className="glass-card" style={{ margin: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <Search style={{ width: 16, height: 16, color: "var(--accent-blue)" }} />
                        Keyword Matches
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {analysis.keywordMatches.map((kw, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                              background: kw.found ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: kw.found ? "var(--accent-green)" : "var(--accent-red)",
                              fontSize: 11, fontWeight: 700,
                            }}>
                              {kw.found ? "✓" : "✗"}
                            </span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)", minWidth: 100 }}>{kw.keyword}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{kw.context}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantification & Action Verbs */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="glass-card" style={{ margin: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <Hash style={{ width: 14, height: 14, color: "var(--accent-purple)" }} />
                        Quantification
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: analysis.quantificationScore >= 60 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                        {analysis.quantificationScore}%
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Bullet points with measurable metrics</p>
                    </div>
                    <div className="glass-card" style={{ margin: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <Zap style={{ width: 14, height: 14, color: "var(--accent-amber)" }} />
                        Action Verbs
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: (analysis.actionVerbAnalysis?.score ?? 0) >= 60 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                        {analysis.actionVerbAnalysis?.score ?? 0}%
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Strong action verb usage</p>
                    </div>
                  </div>

                  {/* ATS Warnings */}
                  {analysis.atsWarnings && analysis.atsWarnings.length > 0 && (
                    <div className="glass-card" style={{ margin: 0, borderColor: "rgba(239, 68, 68, 0.2)" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <ShieldAlert style={{ width: 16, height: 16, color: "var(--accent-red)" }} />
                        ATS Format Warnings
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {analysis.atsWarnings.map((w, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--accent-red)", marginTop: 1, flexShrink: 0 }}>⚠</span> {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA to Builder */}
                  <Link
                    to="/builder"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "12px 16px",
                      background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                      borderRadius: "var(--radius-md)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Sparkles style={{ width: 16, height: 16 }} />
                    Build Your Resume
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 400,
                  color: "var(--text-muted)",
                  gap: 12,
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--bg-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Sparkles style={{ width: 28, height: 28, color: "var(--text-muted)" }} />
                  </div>
                  <p style={{ fontSize: 14 }}>Upload a resume to see the magic happen ✨</p>
                </div>
              )}
            </>
          )}

          {activeTab === "bullet-rewriter" && (
            <BulletPointRewriter
              aiProvider={aiProvider}
              customApiKey={customApiKey}
              customBaseUrl={customBaseUrl}
              customAiModel={customAiModel}
            />
          )}

          {activeTab === "cover-letter" && (
            <CoverLetterGenerator
              resumeText={resumeText}
              jobDescription={jobDescription}
              aiProvider={aiProvider}
              customApiKey={customApiKey}
              customBaseUrl={customBaseUrl}
              customAiModel={customAiModel}
            />
          )}

          {activeTab === "ats-parser" && (
            <ATSParser
              resumeText={resumeText}
              jobDescription={jobDescription}
              aiProvider={aiProvider}
              customApiKey={customApiKey}
              customBaseUrl={customBaseUrl}
              customAiModel={customAiModel}
            />
          )}

          {activeTab === "tailor" && (
            <TailorSuggestions
              resumeText={resumeText}
              jobDescription={jobDescription}
              aiProvider={aiProvider}
              customApiKey={customApiKey}
              customBaseUrl={customBaseUrl}
              customAiModel={customAiModel}
            />
          )}

          {activeTab === "interview-prep" && (
            <InterviewPrep
              resumeText={resumeText}
              jobDescription={jobDescription}
              aiProvider={aiProvider}
              customApiKey={customApiKey}
              customBaseUrl={customBaseUrl}
              customAiModel={customAiModel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
