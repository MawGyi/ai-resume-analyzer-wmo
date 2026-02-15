import { useState } from "react";
import { useFetcher } from "react-router";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import ScoreChart from "~/components/ScoreChart"; // Alias setup needed? Likely relative import works safer.
// If aliases not configured, relative import:
// import ScoreChart from "../components/ScoreChart";

// Use relative import just in case tsconfig paths aren't set
import ScoreChartComponent from "../components/ScoreChart";

export default function Index() {
  const fetcher = useFetcher();
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset state on new file
      setResumeText("");
      setScore(null);
    }
  };

  // Handle Upload & Analyze
  const handleUpload = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Step 1: Parse PDF
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse PDF");

      const data = await response.json();
      setResumeText(data.text); // Extracted text

      // Step 2: Analyze with AI (Mock for now, replace with real Gemini call later)
      // Simulate AI delay
      setTimeout(() => {
        // Mock Result based on text length or keywords (just for demo visualization)
        const mockScore = Math.floor(Math.random() * (95 - 60) + 60); 
        setScore(mockScore);
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error("Error:", error);
      setIsAnalyzing(false);
      alert("Error analyzing resume. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">
          AI Resume Screener 🚀
        </h1>
        <p className="text-gray-500 text-lg">
          Powered by Gemini Pro 1.5 • Instant Feedback • Smart Scoring
        </p>
      </header>

      <main className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Panel: Upload */}
        <div className="p-8 border-r border-gray-100 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-500" />
            Upload Resume
          </h2>
          
          <div className="border-2 border-dashed border-indigo-200 rounded-xl p-10 flex flex-col items-center justify-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="text-center">
                <FileText className="w-12 h-12 text-indigo-600 mb-2 mx-auto" />
                <p className="font-medium text-indigo-900">{file.name}</p>
                <p className="text-sm text-indigo-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                <p className="font-medium text-gray-600">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-gray-400">PDF Only (Max 5MB)</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isAnalyzing}
            className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              !file || isAnalyzing 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>

        {/* Right Panel: Results */}
        <div className="p-8 bg-gray-50/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Analysis Report
          </h2>

          {score !== null ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Score Chart Component */}
              <ScoreChartComponent score={score} />

              {/* Feedback Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Key Insights
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Strong technical skills detected (React, TypeScript).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">!</span> Consider adding more quantifiable results (metrics).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Experience section is well-structured.
                  </li>
                </ul>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
              <p>Upload a resume to see the magic happen ✨</p>
            </div>
          )}
        </div>

      </main>

      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>© 2026 AI Resume Screener. Built by Win Maw Oo.</p>
      </footer>
    </div>
  );
}
