import { useState, useEffect, useRef } from "react";
import {
  Target,
  Sparkles,
  ChevronDown,
  Upload,
  FileText,
  Eye,
  Zap,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Settings,
  Mail,
  Phone,
  MapPin,
  Lightbulb,
  Shield,
  CheckCircle,
  Loader2,
  Network,
  Cpu,
  BarChart3,
  Hash,
  ShieldAlert,
} from "lucide-react";
import "../dashboard.css";
import { useResumeStore } from "~/stores/useResumeStore";
import { useHistoryStore } from "~/stores/useHistoryStore";
import { Clock } from "lucide-react";

/* ── Types ── */
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/* ── Component ── */
export default function Dashboard() {
  const loadResumeData = useResumeStore((s) => s.loadResumeData);
  const resumeData = useResumeStore((s) => s.resumeData);

  // Job Target State
  const [targetJob, setTargetJob] = useState({ title: "Target Role", company: "Any Company" });
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  
  // Settings / Config State
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customAiModel, setCustomAiModel] = useState("");
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  
  // Analysis State
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Save Settings
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    
    // Naively assume basic skills for now to populate the UI realistically
    const skillKeywords = ["JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "GraphQL", "REST", "HTML", "CSS", "Tailwind", "Next.js", "Linux", "CI/CD"];
    const foundSkills = skillKeywords.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()));

    // Load empty/extracted state into store
    loadResumeData({
      personalInfo: {
        fullName,
        title: lines[1] || "Professional",
        email,
        phone,
        location: "Extracted from Resume",
        summary: text.substring(0, 300) + "...",
      },
      experience: [
        {
          id: generateId(),
          company: "Extracted Past Experience",
          role: "Various Roles",
          startDate: "",
          endDate: "",
          highlights: ["Resume text parsed successfully.", "Detailed extraction requires manual review in Builder."],
        },
      ],
      education: [
         {
          id: generateId(),
          institution: "Extracted Education",
          degree: "Degree",
          field: "",
          startDate: "",
          endDate: "",
        }
      ],
      skills: foundSkills.length > 0 ? foundSkills : [],
    });
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setErrorMessage("Please select a resume file first.");
      return;
    }

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
      if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse resume file.");

      parseAndLoadResumeData(parseData.text);

      setStatusMessage("Analyzing with AI...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: parseData.text,
          jobDescription: jobDescription || "General Professional Role",
          provider: aiProvider,
          customApiKey: customApiKey.trim(),
          customBaseUrl: customBaseUrl.trim(),
          customModel: customAiModel.trim(),
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "AI analysis failed.");

      setAnalysis(analyzeData.analysis);
      setStatusMessage("");
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Something went wrong.");
      setStatusMessage("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // UI Gauge Animation
  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  useEffect(() => {
    if (analysis) {
      setGaugeAnimated(false);
      const timer = setTimeout(() => setGaugeAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [analysis]);

  const currentScore = analysis?.matchScore || 0;
  const circumference = 2 * Math.PI * 80;
  const offset = gaugeAnimated ? circumference - (currentScore / 100) * circumference : circumference;
  const gaugeColorClass = currentScore > 80 ? "high" : currentScore > 60 ? "medium" : "low";

  // Use real keyword matches from enriched API data
  const finalKeywords = analysis?.keywordMatches?.length 
    ? analysis.keywordMatches.slice(0, 8).map(kw => ({
        label: kw.keyword,
        fill: kw.found ? 90 : 10,
        status: kw.found ? "found" as const : "missing" as const,
        context: kw.context,
      }))
    : resumeData.skills.slice(0,6).map(s => ({
        label: s, fill: 90, status: "found" as const, context: "",
      }));

  return (
    <div className="dashboard-page">
      {/* ── Dashboard Toolbar ── */}
      <div className="dashboard-toolbar">
        {/* Target Job Selector */}
        <div className="job-selector" ref={dropdownRef}>
          <button
            className="job-selector-btn"
            onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
          >
            <Target style={{ width: 14, height: 14, color: "var(--accent-blue)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span className="job-label">Target Role</span>
              <span className="job-title">{targetJob.title}</span>
            </div>
            <ChevronDown
              style={{
                width: 14,
                height: 14,
                transition: "transform 0.2s",
                transform: jobDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {jobDropdownOpen && (
            <div className="job-dropdown animate-fade-in" style={{ padding: 16, width: 340, background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <label className="dark-label" style={{ fontSize: 13, marginBottom: 8, color: "var(--text-primary)" }}>Job Title / Role</label>
              <input 
                type="text"
                className="dark-input"
                style={{ marginBottom: 16, width: "100%" }}
                value={targetJob.title}
                onChange={e => setTargetJob({ ...targetJob, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
              />
              
              <label className="dark-label" style={{ fontSize: 13, marginBottom: 8, color: "var(--text-primary)" }}>Target Job Description</label>
              <textarea
                className="dark-textarea"
                rows={5}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the Job Description here for an accurate analysis..."
                style={{ width: "100%", marginBottom: 16, resize: "vertical" }}
              />

              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setJobDropdownOpen(false)}
              >
                Save Target Profile
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* File Picker */}
          <label className="btn-secondary" style={{ cursor: "pointer", margin: 0, border: "1px dashed var(--border-strong)" }}>
            <FileText style={{ width: 15, height: 15 }} />
            {file ? (file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name) : "Select Resume"}
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {/* Analyze Button */}
          <button 
            className="btn-primary" 
            onClick={file ? handleUploadAndAnalyze : () => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) input.click();
            }} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
            ) : file ? (
              <Sparkles style={{ width: 15, height: 15 }} />
            ) : (
              <Upload style={{ width: 15, height: 15 }} />
            )}
            {isAnalyzing ? "Processing..." : file ? "Analyze Now" : "Upload & Analyze"}
          </button>

          {/* Settings Toggle */}
          <button className={`btn-ghost ${showSettings ? 'selected' : ''}`} onClick={() => setShowSettings(!showSettings)} title="AI Settings">
            <Settings style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="glass-card animate-slide-down" style={{ margin: "16px 24px", maxWidth: "800px" }}>
          <div className="glass-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
             <Settings style={{ width: 14, height: 14 }} /> AI Analysis Configuration
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="dark-label" style={{ fontSize: 11 }}>Provider</label>
              <select value={aiProvider} onChange={e => setAiProvider(e.target.value as any)} className="dark-select">
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI Compatible</option>
              </select>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 }}>
              <label className="dark-label" style={{ fontSize: 11 }}>API Key</label>
              <input type="password" value={customApiKey} onChange={e => setCustomApiKey(e.target.value)} className="dark-input" placeholder="Enter API Key..." />
            </div>

            {aiProvider === "openai" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 }}>
                  <label className="dark-label" style={{ fontSize: 11 }}><Network style={{ width: 10, height: 10 }} /> Base URL</label>
                  <input type="url" value={customBaseUrl} onChange={e => setCustomBaseUrl(e.target.value)} className="dark-input" placeholder="e.g. https://opencode.ai/zen/v1" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="dark-label" style={{ fontSize: 11 }}><Cpu style={{ width: 10, height: 10 }} /> Model</label>
                  <input type="text" value={customAiModel} onChange={e => setCustomAiModel(e.target.value)} className="dark-input" placeholder="gpt-4o-mini" />
                </div>
              </>
            )}

            <button className={isConfigSaved ? "btn-accent-green" : "btn-secondary"} onClick={handleSaveConfig} style={{ height: 36, padding: "0 16px" }}>
              {isConfigSaved ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Settings style={{ width: 14, height: 14 }} />}
              {isConfigSaved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* ── Error Notification ── */}
      {errorMessage && (
        <div className="error-toast" style={{ margin: "16px 24px 0" }}>
          <XCircle style={{ width: 16, height: 16, color: "var(--accent-red)", flexShrink: 0 }} />
          <span className="error-toast-text">{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="error-toast-close">
            <XCircle style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* ── Empty & Loading States ── */}
      {isAnalyzing && (
        <div className="empty-state">
          <div className="drop-zone" style={{ border: "none", background: "transparent" }}>
             <Loader2 style={{ width: 48, height: 48, animation: "spin 1s linear infinite", color: "var(--accent-blue)", marginBottom: 16 }} />
             <h3 style={{ color: "var(--text-primary)" }}>{statusMessage}</h3>
             <p style={{ color: "var(--text-secondary)" }}>This might take a few moments...</p>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="empty-state">
          <div className="drop-zone animate-slide-up" onClick={() => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) input.click();
          }}>
            <div className="drop-zone-icon">
              <Upload />
            </div>
            <h3>{file ? "Resume Ready" : "Start Your Analysis"}</h3>
            <p>
              {file 
                ? "Click 'Analyze Now' in the toolbar to generate your intelligence report."
                : "Upload your resume and pair it with a Job Description to find optimization opportunities, keyword gaps, and generate an ATS match score."}
            </p>
            <div className="drop-zone-formats">
              <span className="format-badge">.PDF</span>
              <span className="format-badge">.DOCX</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Analysis Workspace ── */}
      {analysis && !isAnalyzing && (
        <div className="workspace animate-fade-in">
          
          {/* ── Left Pane: Resume Data Preview ── */}
          <div className="resume-preview-pane">
            <div className="resume-preview-header">
              <h2>
                <Eye />
                Live Resume Data
              </h2>
              <span className="badge badge-blue" style={{ animation: "pulse-glow-blue 3s ease-in-out infinite" }}>
                <Sparkles style={{ width: 12, height: 12 }} />
                AI Synced
              </span>
            </div>

            <div className="resume-paper animate-fade-in">
              <div className="resume-name">{resumeData.personalInfo.fullName || "Name Not Provided"}</div>
              <div className="resume-title-role">{resumeData.personalInfo.title}</div>

              <div className="resume-contact">
                {resumeData.personalInfo.email && (
                  <span><Mail /> {resumeData.personalInfo.email}</span>
                )}
                {resumeData.personalInfo.phone && (
                  <span><Phone /> {resumeData.personalInfo.phone}</span>
                )}
                {resumeData.personalInfo.location && (
                  <span><MapPin /> {resumeData.personalInfo.location}</span>
                )}
              </div>

              {resumeData.personalInfo.summary && (
                <div style={{ marginTop: 20, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                   {resumeData.personalInfo.summary}
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="resume-section">
                  <div className="resume-section-title">Experience</div>
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="resume-entry">
                      <div className="resume-entry-header">
                        <div>
                          <span className="entry-role">{exp.role}</span>
                          {exp.company && <span className="entry-company"> · {exp.company}</span>}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                           <span className="entry-date">{exp.startDate} - {exp.endDate}</span>
                        )}
                      </div>
                      {exp.highlights.map((bullet, j) => (
                        <div key={j} className="heatmap-bullet">
                           <span className="legend-dot green" style={{ width: 6, height: 6, display: "inline-block", marginRight: 8 }} />
                           <span style={{ flex: 1 }}>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="resume-section">
                  <div className="resume-section-title">Education</div>
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="resume-entry">
                       <div className="resume-entry-header">
                         <div>
                           <span className="entry-role">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                           {edu.institution && <span className="entry-company"> · {edu.institution}</span>}
                         </div>
                         {(edu.startDate || edu.endDate) && (
                            <span className="entry-date">{edu.startDate} - {edu.endDate}</span>
                         )}
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="resume-section">
                  <div className="resume-section-title">Extracted Skills</div>
                  <div className="resume-skills">
                    {resumeData.skills.map((skill, i) => (
                      <span key={i} className="resume-skill-tag matched">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Pane: Smart Optimization Panel ── */}
          <div className="optimization-pane">
            <h2>
              <Zap />
              Intelligence Dashboard
            </h2>

            {/* Score Gauge */}
            <div className="glass-card animate-slide-up">
              <div className="glass-card-title">Match Score</div>
              <div className="score-gauge-container">
                <div className="score-gauge">
                  <svg viewBox="0 0 180 180">
                    <circle className="gauge-bg" cx="90" cy="90" r="80" />
                    <circle
                      className={`gauge-fill ${gaugeColorClass}`}
                      cx="90"
                      cy="90"
                      r="80"
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                      }}
                    />
                  </svg>
                  <div className="score-gauge-text">
                    <span className="score-number">
                      {currentScore}
                      <span className="score-percent">%</span>
                    </span>
                    <div className="score-label">vs Custom Target Profile</div>
                  </div>
                </div>
                <div className={`score-verdict ${analysis.overallVerdict === "Strong Match" ? "excellent" : analysis.overallVerdict === "Good Potential" ? "good" : "needs-improvement"}`}>
                  <Shield style={{ width: 14, height: 14 }} />
                  {analysis.overallVerdict}
                </div>
              </div>

              <div className="stats-row">
                 <p style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                   "{analysis.summary}"
                 </p>
              </div>
            </div>

            {/* Keyword Gap Analysis */}
            {finalKeywords.length > 0 && (
              <div className="glass-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="glass-card-title">Keyword Coverage</div>
                {finalKeywords.map((kw, i) => (
                  <div key={i} className="keyword-bar">
                    <span className="kw-label">{kw.label}</span>
                    <div className="kw-track">
                      <div
                        className={`kw-fill ${kw.status}`}
                        style={{ width: gaugeAnimated ? `${kw.fill}%` : "0%" }}
                      />
                    </div>
                    <span className="kw-value">{kw.status === "found" ? "HIT" : "GAP"}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Section Scores */}
            {analysis.sectionScores && (
              <div className="glass-card animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="glass-card-title">
                  <BarChart3 style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  Section Scores
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {([
                    { label: "Experience", value: analysis.sectionScores.experience },
                    { label: "Skills", value: analysis.sectionScores.skills },
                    { label: "Education", value: analysis.sectionScores.education },
                    { label: "Format", value: analysis.sectionScores.format },
                    { label: "Summary", value: analysis.sectionScores.summary },
                  ] as const).map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.value >= 70 ? "var(--accent-green)" : s.value >= 50 ? "var(--accent-amber)" : "var(--accent-red)" }}>
                        {s.value}<span style={{ fontSize: 12, fontWeight: 400 }}>%</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantification & Action Verbs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="glass-card animate-slide-up" style={{ margin: 0, animationDelay: "0.2s" }}>
                <div className="glass-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Hash style={{ width: 12, height: 12 }} />
                  Metrics Usage
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: (analysis.quantificationScore ?? 0) >= 60 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                  {analysis.quantificationScore ?? 0}%
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Bullets with numbers</div>
              </div>
              <div className="glass-card animate-slide-up" style={{ margin: 0, animationDelay: "0.25s" }}>
                <div className="glass-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Zap style={{ width: 12, height: 12 }} />
                  Action Verbs
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: (analysis.actionVerbAnalysis?.score ?? 0) >= 60 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                  {analysis.actionVerbAnalysis?.score ?? 0}%
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Strong verb usage</div>
              </div>
            </div>

            {/* Real-time Suggestion Feed */}
            <div className="glass-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="glass-card-title">Strategic Insights</div>
              <div className="suggestion-feed">
                {/* Improvements */}
                {analysis.improvements.map((suggestion, i) => (
                  <div key={`imp-${i}`} className="suggestion-item">
                    <div className="suggestion-icon critical" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                      <AlertTriangle style={{ color: "var(--accent-red)" }} />
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-title">Optimization Opportunity</div>
                      <div className="suggestion-desc">{suggestion}</div>
                    </div>
                  </div>
                ))}

                {/* Missing Skills */}
                {analysis.missingSkills.length > 0 && (
                   <div className="suggestion-item">
                     <div className="suggestion-icon warning" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                       <Lightbulb style={{ color: "var(--accent-amber)" }} />
                     </div>
                     <div className="suggestion-content">
                       <div className="suggestion-title">Missing Core Skills</div>
                       <div className="suggestion-desc">Consider adding: {analysis.missingSkills.join(", ")}</div>
                     </div>
                   </div>
                )}

                {/* Strengths */}
                {analysis.strengths.map((strength, i) => (
                  <div key={`str-${i}`} className="suggestion-item">
                    <div className="suggestion-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                      <CheckCircle style={{ color: "var(--accent-green)" }} />
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-title">Identified Strength</div>
                      <div className="suggestion-desc">{strength}</div>
                    </div>
                  </div>
                ))}

                {/* ATS Warnings */}
                {analysis.atsWarnings && analysis.atsWarnings.length > 0 && (
                  analysis.atsWarnings.map((warning, i) => (
                    <div key={`ats-${i}`} className="suggestion-item">
                      <div className="suggestion-icon" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                        <ShieldAlert style={{ color: "var(--accent-red)" }} />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-title">ATS Warning</div>
                        <div className="suggestion-desc">{warning}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

            {/* Analysis History */}
            {(() => {
              const historyEntries = useHistoryStore.getState().entries;
              if (historyEntries.length === 0) return null;
              return (
                <div className="glass-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="glass-card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock style={{ width: 13, height: 13 }} />
                      Recent Analyses
                    </div>
                    <button
                      onClick={() => { useHistoryStore.getState().clearHistory(); window.location.reload(); }}
                      style={{ fontSize: 10, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {historyEntries.slice(0, 10).map((entry) => (
                      <div key={entry.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 10px", borderRadius: "var(--radius-md)",
                        background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.fileName}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                            {new Date(entry.timestamp).toLocaleDateString()} · {entry.overallVerdict}
                          </div>
                        </div>
                        <div style={{
                          fontSize: 18, fontWeight: 700, marginLeft: 12,
                          color: entry.matchScore >= 80 ? "var(--accent-green)" : entry.matchScore >= 60 ? "var(--accent-amber)" : "var(--accent-red)",
                        }}>
                          {entry.matchScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}
