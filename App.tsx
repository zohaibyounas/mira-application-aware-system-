import React, { useState, useEffect } from "react";
import {
  ApplicationType,
  WorkflowStep,
  AnalysisResult,
  GapDetail,
} from "./types";
import { analyzeSystemDescription } from "./geminiService";
import html2pdf from "html2pdf.js";

const Header: React.FC = () => (
  <header className="bg-slate-900 border-b-2 border-blue-600/50 sticky top-0 z-50 no-print shadow-xl">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2.5}
              d="M11 4H4v14a2 2 0 002 2h12a2 2 0 002-2v-5M9 15l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-black text-white leading-none tracking-tighter text-2xl">
            Mira <span className="text-blue-500">Elektronikentwicklung</span>
          </h1>
          <p className="text-[10px] text-blue-500/80 font-black tracking-[0.2em] uppercase mt-1">
            Readiness & Safety Validation
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-slate-700 bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          System Online
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 font-black text-sm hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          onClick={() => alert("Mira Engineering Portal: Restricted Access")}
        >
          LOG IN
        </button>
      </nav>
    </div>
  </header>
);

const StepIndicator: React.FC<{ currentStep: WorkflowStep }> = ({
  currentStep,
}) => {
  const steps = [
    { id: WorkflowStep.USER_INPUT, label: "Entry" },
    { id: WorkflowStep.PARSING, label: "Parse" },
    { id: WorkflowStep.DETECTION, label: "Detect" },
    { id: WorkflowStep.PROFILE_LOADING, label: "Profile" },
    { id: WorkflowStep.GAP_ANALYSIS, label: "Gaps" },
    { id: WorkflowStep.GENERATION, label: "Synth" },
    { id: WorkflowStep.FINAL_STOP, label: "Review" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-16 no-print">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200" />
        <div
          className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          style={{
            width: `${
              Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100
            }%`,
          }}
        />
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center border-4 transition-all duration-500 ${
                currentStep === step.id
                  ? "bg-slate-900 border-blue-600 text-blue-500 scale-110 shadow-lg"
                  : currentStep > step.id
                  ? "bg-blue-600 border-blue-600 text-slate-900"
                  : "bg-white border-slate-200 text-slate-300"
              }`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="text-sm font-black italic">{step.id}</span>
              )}
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest mt-4 ${
                currentStep === step.id
                  ? "text-slate-900"
                  : currentStep > step.id
                  ? "text-slate-500"
                  : "text-slate-300"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailedGapCard: React.FC<{
  gap: GapDetail;
  type: "missing" | "vague" | "assumption";
}> = ({ gap, type }) => {
  const styles = {
    missing: {
      bg: "bg-red-50",
      border: "border-red-900",
      text: "text-red-900",
      accent: "bg-red-900",
      label: "CRITICAL MISSING",
    },
    vague: {
      bg: "bg-blue-50",
      border: "border-blue-900",
      text: "text-blue-900",
      accent: "bg-blue-900",
      label: "STRATEGIC AMBIGUITY",
    },
    assumption: {
      bg: "bg-slate-100",
      border: "border-slate-900",
      text: "text-slate-900",
      accent: "bg-slate-900",
      label: "HIDDEN ASSUMPTION",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border-2 ${style.border} p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8 break-inside-avoid card`}
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`${style.accent} text-[9px] font-black text-white px-3 py-1 tracking-widest uppercase`}
        >
          {style.label}
        </span>
      </div>
      <h5 className="text-xl font-black text-slate-900 mb-3 leading-tight uppercase italic">
        {gap.title}
      </h5>
      <p className="text-slate-800 text-sm leading-relaxed mb-6 font-medium">
        {gap.explanation}
      </p>

      <div className="border-t border-slate-900/10 pt-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className={`w-4 h-4 ${style.text}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Risk Assessment
          </span>
        </div>
        <p className="text-xs font-black text-slate-900 leading-snug uppercase tracking-tight">
          {gap.implication}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.USER_INPUT);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Set the filename for PDF download via document title
  useEffect(() => {
    if (step === WorkflowStep.FINAL_STOP && result) {
      document.title = `MIRA_ENGINEERING_REPORT_${result.profile.type
        .replace(/\s+/g, "_")
        .toUpperCase()}`;
    } else {
      document.title = "Mira Engineering Platform";
    }
  }, [step, result]);

  const handleStartAnalysis = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setRequestSent(false);

    const sequence = [
      WorkflowStep.PARSING,
      WorkflowStep.DETECTION,
      WorkflowStep.PROFILE_LOADING,
      WorkflowStep.GAP_ANALYSIS,
      WorkflowStep.GENERATION,
      WorkflowStep.FINAL_STOP,
    ];

    try {
      const analysisPromise = analyzeSystemDescription(description);

      for (const s of sequence) {
        setStep(s);
        await new Promise((r) => setTimeout(r, 700));
        if (s === WorkflowStep.GAP_ANALYSIS) {
          const data = await analysisPromise;
          setResult(data);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        "Analysis Terminal Error: Incomplete technical profile. Provide deeper MCU or safety path detail."
      );
      setStep(WorkflowStep.USER_INPUT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById("pdf-report");

    if (!element) return;

    const fileName = result
      ? `MIRA_ENGINEERING_REPORT_${result.profile.type
          .replace(/\s+/g, "_")
          .toUpperCase()}.pdf`
      : "MIRA_ENGINEERING_REPORT.pdf";

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save(); // ⬅️ DIRECT DOWNLOAD
  };

  const handleRequestReview = async () => {
    setIsRequesting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsRequesting(false);
    setRequestSent(true);
    alert(
      "CRITICAL: Engineering Review Request Dispatched to Mira Safety Division."
    );
  };

  const reset = () => {
    setStep(WorkflowStep.USER_INPUT);
    setResult(null);
    setDescription("");
    setError(null);
    setRequestSent(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 print:p-0 print:max-w-none relative z-10">
        <StepIndicator currentStep={step} />

        {step === WorkflowStep.USER_INPUT && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 no-print">
            <div className="mb-12 border-l-8 border-blue-600 pl-8">
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">
                Pre-Assessment Engine
              </h2>
              <p className="text-slate-600 text-xl max-w-2xl font-bold leading-relaxed">
                Analyze system descriptions against high-integrity engineering
                profiles to detect architectural gaps before deployment.
              </p>
            </div>

            <div className="bg-slate-900 p-1 border-2 border-slate-900 shadow-[20px_20px_0px_0px_rgba(37,99,235,0.1)]">
              <div className="bg-slate-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                    Terminal Input v4.2
                  </div>
                </div>

                <textarea
                  className="w-full h-80 bg-slate-900 border-2 border-slate-700 p-8 text-blue-400 text-2xl font-medium focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800 mono resize-none shadow-inner"
                  placeholder="[SYSTEM_DESC_INPUT]: Enter technical specifications, voltage levels, safety paths, and MCU families..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isAnalyzing}
                />

                {error && (
                  <div className="mt-6 p-4 bg-red-900/20 text-red-500 text-xs font-black uppercase border border-red-900/50 flex items-center gap-3 animate-pulse">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-start gap-3 max-w-sm">
                    <div className="w-10 h-10 bg-slate-700 shrink-0 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a11.955 11.955 0 001.902 12.427L12 21l7.098-2.326a11.955 11.955 0 001.902-12.427l-.382-.091z"
                        />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
                      System automatically classifies application into BMS,
                      Motor Control, or Generic Embedded Safety profiles.
                    </p>
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    disabled={!description.trim() || isAnalyzing}
                    className="w-full md:w-auto bg-blue-600 text-white px-16 py-6 font-black text-2xl hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
                  >
                    {isAnalyzing ? (
                      <svg
                        className="animate-spin h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        INITIALIZE SCAN
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                            strokeWidth={2.5}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step > WorkflowStep.USER_INPUT && step < WorkflowStep.FINAL_STOP && (
          <div className="flex flex-col items-center justify-center py-40 no-print animate-in fade-in duration-1000">
            <div className="relative mb-16 h-48 w-48 flex items-center justify-center">
              <div className="absolute inset-0 border-[12px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-5xl font-black text-slate-900 italic">
                {Math.round((step / 7) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">
                {step === WorkflowStep.PARSING && "Extracting Entities..."}
                {step === WorkflowStep.DETECTION && "Detecting Domain..."}
                {step === WorkflowStep.PROFILE_LOADING &&
                  "Loading Safety Profile..."}
                {step === WorkflowStep.GAP_ANALYSIS &&
                  "Identifying Vulnerabilities..."}
                {step === WorkflowStep.GENERATION &&
                  "Synthesizing Artifacts..."}
              </p>
              <div className="h-1 w-64 bg-slate-900 mx-auto"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs mt-6">
                Mira Strategic Intelligence Processor
              </p>
            </div>
          </div>
        )}

        {step === WorkflowStep.FINAL_STOP && result && (
          <div
            id="pdf-report"
            className="grid grid-cols-1 lg:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 print:block"
          >
            {/* Header Block for PDF */}
            <div className="hidden print:block mb-16 border-b-8 border-slate-900 pb-12">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-7xl font-black text-slate-900 tracking-tighter italic">
                    READINESS AUDIT
                  </h1>
                  <p className="text-2xl font-bold text-slate-500 uppercase tracking-[0.4em] mt-4">
                    Pre-Engineering Gap Analysis Report
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-black text-5xl tracking-tighter">
                    MIRA READY
                  </div>
                  <div className="text-xs font-black text-slate-400 mt-4 tracking-widest font-mono">
                    REF: ASSESSMENT_
                    {Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 px-1 bg-slate-900 border-2 border-slate-900 shadow-xl">
                <div className="bg-white p-8">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Application Profile
                  </div>
                  <div className="font-black text-slate-900 text-2xl uppercase italic">
                    {result.profile.type}
                  </div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Confidence Index
                  </div>
                  <div className="font-black text-blue-600 text-3xl">
                    {(result.profile.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Safety Classification
                  </div>
                  <div className="font-black text-slate-900 text-2xl uppercase italic">
                    High Integrity
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="lg:col-span-1 space-y-12 no-print ">
              <div className="bg-slate-900 p-1  shadow-2xl sticky top-24">
                <div className="bg-slate-800 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-12 bg-blue-600 flex items-center justify-center text-white text-xl font-black italic shadow-lg">
                      {result.profile.type[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-md leading-none uppercase italic tracking-tighter">
                        {result.profile.type}
                      </h4>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">
                        Active Profile
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <button
                      onClick={handleExportPDF}
                      className="w-full bg-blue-600 text-white py-4 font-black text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-blue-900/40"
                    >
                      {/* <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          strokeWidth={2.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg> */}
                      DOWNLOAD PDF REPORT
                    </button>
                    <button
                      onClick={handleRequestReview}
                      disabled={isRequesting || requestSent}
                      className={`w-full py-4 font-black text-lg transition-all flex items-center justify-center gap-3 border-2 ${
                        requestSent
                          ? "bg-green-500/10 text-green-500 border-green-500"
                          : "bg-white text-slate-900 border-slate-900 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {isRequesting ? (
                        <div className="w-6 h-6 border-4 border-blue-600/30 border-t-blue-600 animate-spin rounded-full"></div>
                      ) : requestSent ? (
                        "DISPATCHED"
                      ) : (
                        "REQUEST REVIEW"
                      )}
                    </button>
                    <button
                      onClick={reset}
                      className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors pt-4 text-center"
                    >
                      RESET TERMINAL
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">
                  Scan Metrics
                </h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Gaps Detected
                    </span>
                    <span className="text-xl font-black italic text-red-600">
                      {result.gaps.missingTopics.length +
                        result.gaps.dangerousAssumptions.length +
                        result.gaps.vagueSpecifications.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Confidence
                    </span>
                    <span className="text-xl font-black italic text-blue-600">
                      {(result.profile.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Report Area */}
            <div className="lg:col-span-3 space-y-16 print:mt-12">
              <div className="border-b-4 border-slate-900 pb-8 flex items-end justify-between print:border-slate-900">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                  Engineering Exposure Gaps
                </h3>
                <div className="hidden md:block bg-red-100 text-red-700 text-[10px] font-black px-4 py-2 border-2 border-red-700 uppercase tracking-widest no-print">
                  Critical Risks Identified
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                {result.gaps.missingTopics.length > 0 && (
                  <section>
                    <h5 className="text-[12px] font-black uppercase text-slate-900 tracking-[0.3em] mb-8 flex items-center gap-3">
                      <span className="w-6 h-6 bg-red-600"></span>
                      Structural Deficiencies
                    </h5>
                    {result.gaps.missingTopics.map((g, i) => (
                      <DetailedGapCard key={i} gap={g} type="missing" />
                    ))}
                  </section>
                )}

                {result.gaps.dangerousAssumptions.length > 0 && (
                  <section>
                    <h5 className="text-[12px] font-black uppercase text-slate-900 tracking-[0.3em] mb-8 flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-900"></span>
                      Unstated Premises
                    </h5>
                    {result.gaps.dangerousAssumptions.map((g, i) => (
                      <DetailedGapCard key={i} gap={g} type="assumption" />
                    ))}
                  </section>
                )}
              </div>

              {/* Artifacts Section */}
              <div className="pt-16 border-t-8 border-slate-900">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-12">
                  Draft Engineering Artifacts
                </h3>

                <div className="space-y-16">
                  {result.artifacts.map((artifact, i) => (
                    <div
                      key={i}
                      className="card bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col blueprint-bg print:shadow-none print:border-4"
                    >
                      <div className="bg-slate-900 px-10 py-6 flex items-center justify-between print:bg-slate-900 print:text-white">
                        <div className="flex items-center gap-6">
                          <div className="w-4 h-4 bg-blue-600 no-print" />
                          <h4 className="font-black text-white uppercase tracking-tight text-2xl italic leading-none">
                            {artifact.title}
                          </h4>
                        </div>
                        <div className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-4 py-2 border border-blue-400/30 uppercase tracking-[0.3em]">
                          {artifact.type}
                        </div>
                      </div>

                      <div className="p-12">
                        {artifact.type === "code" ? (
                          <div className="bg-slate-900 p-10 overflow-x-auto shadow-2xl print:bg-slate-50 print:border-2 print:border-slate-900">
                            <pre className="mono text-blue-400 text-sm leading-relaxed print:text-slate-900">
                              <code className="block select-all">
                                {artifact.content}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <div className="text-slate-900 font-bold whitespace-pre-wrap leading-relaxed text-xl print:text-base">
                            {artifact.content}
                          </div>
                        )}
                      </div>

                      <div className="px-10 py-6 bg-blue-600 text-white border-t-2 border-slate-900">
                        <div className="flex gap-8 items-center">
                          <span className="font-black text-[12px] uppercase tracking-widest whitespace-nowrap bg-slate-900 text-white px-3 py-1">
                            Notice
                          </span>
                          <p className="text-xs italic font-black leading-relaxed uppercase tracking-tight">
                            {artifact.disclaimer} This artifact is an
                            illustrative framework. Final engineering validation
                            is strictly mandatory.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Footer */}
              <div className="hidden print:block mt-32 pt-16 border-t-8 border-slate-900 text-center">
                <div className="text-5xl font-black text-slate-900 mb-6 tracking-tighter italic">
                  MIRA ELEKTRONIKENTWICKLUNG
                </div>
                <p className="text-blue-600 font-black text-lg uppercase tracking-[0.5em] mb-12 italic">
                  Precision Safety Verification Platform
                </p>
                <div className="max-w-4xl mx-auto border-4 border-slate-900 p-8 text-left bg-slate-50">
                  <p className="text-slate-900 text-xs font-black uppercase leading-relaxed tracking-tight">
                    LEGAL STATUS: PRELIMINARY GAP ANALYSIS. THIS DOCUMENT IS NOT
                    AN AUDIT CERTIFICATE. This report represents a structural
                    assessment based on machine intelligence analysis of
                    user-provided data. All safety thresholds, component
                    selections, and architectural paths must be reviewed and
                    signed off by a certified human safety engineer from Mira or
                    an equivalent high-integrity engineering body.
                  </p>
                </div>
                <p className="text-slate-400 text-[10px] mt-12 font-black uppercase tracking-widest">
                  © 2024 MIRA Engineering Division | All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
