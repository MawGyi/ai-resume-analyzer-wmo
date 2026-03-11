import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FileDown,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";
import ResumeEditor from "~/components/builder/ResumeEditor";
import ResumePreview from "~/components/builder/ResumePreview";
import { downloadDocx } from "~/lib/generateDocx";

export function meta() {
  return [
    { title: "Resume Builder | AI Resume Intelligence" },
    {
      name: "description",
      content: "Build and export your professional resume in PDF and Word formats.",
    },
  ];
}

// Client-only PDF export button component
function PdfDownloadButton() {
  const [PdfModule, setPdfModule] = useState<{
    BlobProvider: any;
    ResumePdfDocument: any;
  } | null>(null);
  const resumeData = useResumeStore((s) => s.resumeData);

  useEffect(() => {
    Promise.all([
      import("@react-pdf/renderer"),
      import("~/components/builder/ResumePdfDocument"),
    ]).then(([renderer, pdfDoc]) => {
      setPdfModule({
        BlobProvider: renderer.BlobProvider,
        ResumePdfDocument: pdfDoc.default,
      });
    });
  }, []);

  const fileName =
    resumeData.personalInfo.fullName.replace(/\s+/g, "_") || "resume";

  if (!PdfModule) {
    return (
      <button disabled className="btn-primary" style={{ opacity: 0.5, cursor: "not-allowed" }}>
        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
        <span>Loading...</span>
      </button>
    );
  }

  const { BlobProvider, ResumePdfDocument } = PdfModule;

  return (
    <BlobProvider document={<ResumePdfDocument data={resumeData} />}>
      {({ blob, loading }: { blob: Blob | null; loading: boolean }) => (
        <button
          onClick={() => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${fileName}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          disabled={loading || !blob}
          className="btn-primary"
        >
          {loading ? (
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
          ) : (
            <FileDown style={{ width: 14, height: 14 }} />
          )}
          <span>{loading ? "Generating..." : "Download PDF"}</span>
        </button>
      )}
    </BlobProvider>
  );
}

export default function BuilderPage() {
  const resumeData = useResumeStore((s) => s.resumeData);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadWord = async () => {
    setIsExportingWord(true);
    try {
      await downloadDocx(resumeData);
    } catch (err) {
      console.error("Word export error:", err);
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 56px)" }}>
      {/* Builder Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-tertiary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles style={{ width: 16, height: 16, color: "var(--accent-blue)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Resume Builder
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isClient && <PdfDownloadButton />}
          <button
            onClick={handleDownloadWord}
            disabled={isExportingWord}
            className="btn-secondary"
          >
            {isExportingWord ? (
              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            ) : (
              <FileText style={{ width: 14, height: 14 }} />
            )}
            <span>{isExportingWord ? "Generating..." : "Download Word"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        overflow: "hidden",
      }}>
        {/* Left: Editor */}
        <div style={{ overflowY: "auto", paddingRight: 8 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: 12,
          }}>
            Editor
          </p>
          <ResumeEditor />
        </div>

        {/* Right: Preview */}
        <div style={{ overflowY: "auto", paddingLeft: 8, borderLeft: "1px solid var(--border-subtle)" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: 12,
          }}>
            Live Preview
          </p>
          <div style={{
            borderRadius: "var(--radius-lg)",
            overflow: "auto",
            maxHeight: "calc(100vh - 180px)",
          }}>
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
