import { Outlet, useLocation, Link } from "react-router";
import {
  Sparkles,
  LayoutDashboard,
  FileSearch,
  Hammer,
  Settings,
  ChevronDown,
  CircleCheck,
  Circle,
} from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";
import { useHistoryStore } from "~/stores/useHistoryStore";

const NAV_ITEMS = [
  { id: "home", path: "/", label: "Analyzer", icon: FileSearch },
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "builder", path: "/builder", label: "Resume Builder", icon: Hammer },
];

const PAGE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  "/": { title: "AI Resume Intelligence", breadcrumb: "Analyzer" },
  "/dashboard": { title: "AI Resume Intelligence", breadcrumb: "Dashboard" },
  "/builder": { title: "AI Resume Intelligence", breadcrumb: "Resume Builder" },
};

export default function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || PAGE_TITLES["/"];
  const resumeData = useResumeStore((s) => s.resumeData);
  const historyEntries = useHistoryStore((s) => s.entries);

  // Progress checks
  const checks = [
    { label: "Profile", done: !!(resumeData.personalInfo.fullName && resumeData.personalInfo.email) },
    { label: "Experience", done: resumeData.experience.some((e) => e.role && e.company) },
    { label: "Education", done: resumeData.education.some((e) => e.institution) },
    { label: "Skills", done: resumeData.skills.length >= 3 },
    { label: "Analyzed", done: historyEntries.length > 0 },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checks.length) * 100);

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <nav className="sidebar">
        <Link to="/" className="sidebar-logo">
          <Sparkles />
        </Link>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`sidebar-item ${currentPath === item.path ? "active" : ""}`}
          >
            <item.icon />
            <span className="sidebar-tooltip">{item.label}</span>
          </Link>
        ))}

        <div className="sidebar-divider" />

        {/* Progress indicator */}
        <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative", width: 36, height: 36 }}>
            <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none"
                stroke={progressPct === 100 ? "var(--accent-green)" : "var(--accent-blue)"}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(progressPct / 100) * 94.25} 94.25`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 9, fontWeight: 700, color: "var(--text-primary)" }}>
              {progressPct}%
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            {checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {c.done ? (
                  <CircleCheck style={{ width: 10, height: 10, color: "var(--accent-green)", flexShrink: 0 }} />
                ) : (
                  <Circle style={{ width: 10, height: 10, color: "var(--text-muted)", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 9, color: c.done ? "var(--text-secondary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-item">
            <Settings />
            <span className="sidebar-tooltip">Settings</span>
          </button>
        </div>
      </nav>

      {/* ── Main Area ── */}
      <div className="app-main">
        {/* ── Header ── */}
        <header className="app-header">
          <div className="app-header-left">
            <span className="app-header-title">{pageInfo.title}</span>
            <div className="app-header-breadcrumb">
              <ChevronDown style={{ width: 12, height: 12, transform: "rotate(-90deg)" }} />
              <span>{pageInfo.breadcrumb}</span>
            </div>
          </div>
          <div className="app-header-right">
            <button className="avatar-btn">WM</button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

