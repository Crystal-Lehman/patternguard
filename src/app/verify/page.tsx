"use client";

import { useState } from "react";
import { FileSearch, Loader2, Upload, Link2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import FileUploadComponent from "@/components/FileUpload";
import SwaggerInput from "@/components/SwaggerInput";
import VerificationReportView from "@/components/VerificationReport";
import { useStandards } from "@/lib/standards-context";
import type { VerificationReport, VerificationResult, VerificationStatus } from "@/lib/types";

type InputMode = "swagger" | "diagram";

export default function VerifyPage() {
  const { enabledStandards } = useStandards();
  const [mode, setMode] = useState<InputMode>("swagger");
  const [swaggerUrl, setSwaggerUrl] = useState("");
  const [swaggerContent, setSwaggerContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);

  const canSubmit =
    mode === "swagger"
      ? swaggerUrl.trim() !== "" || swaggerContent.trim() !== ""
      : selectedFile !== null;

  const handleVerify = async () => {
    if (!canSubmit || enabledStandards.length === 0) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const formData = new FormData();
      formData.set("inputType", mode);
      formData.set(
        "standards",
        JSON.stringify(
          enabledStandards.map((s) => ({
            name: s.name,
            description: s.description,
            category: s.category,
            severity: s.severity,
          }))
        )
      );

      if (mode === "swagger") {
        if (swaggerUrl) formData.set("swaggerUrl", swaggerUrl);
        if (swaggerContent) formData.set("swaggerContent", swaggerContent);
      } else if (selectedFile) {
        formData.set("file", selectedFile);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();

      const results: VerificationResult[] = enabledStandards.map((standard) => {
        const aiResult = data.results?.find(
          (r: { standardName: string }) =>
            r.standardName.toLowerCase() === standard.name.toLowerCase()
        );

        return {
          standardId: standard.id,
          standardName: standard.name,
          category: standard.category,
          severity: standard.severity,
          status: (aiResult?.status || "not_applicable") as VerificationStatus,
          details: aiResult?.details || "No analysis available for this standard.",
          suggestion: aiResult?.suggestion,
        };
      });

      const summary = {
        total: results.length,
        passed: results.filter((r) => r.status === "pass").length,
        failed: results.filter((r) => r.status === "fail").length,
        warnings: results.filter((r) => r.status === "warning").length,
        notApplicable: results.filter((r) => r.status === "not_applicable")
          .length,
      };

      const inputName =
        mode === "swagger"
          ? swaggerUrl || "Pasted Swagger Spec"
          : selectedFile?.name || "Uploaded Diagram";

      setReport({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        inputType: mode,
        inputName,
        results,
        summary,
        aiRecommendations: data.recommendations || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Verify Architecture
        </h1>
        <p className="text-sm text-zinc-500">
          Upload a diagram or provide a Swagger spec to check against{" "}
          {enabledStandards.length} enabled standards.
        </p>
      </div>

      <div className="mb-6 flex rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
        {[
          { key: "swagger" as const, label: "Swagger / OpenAPI", icon: Link2 },
          { key: "diagram" as const, label: "Architecture Diagram", icon: Upload },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {mode === "swagger" ? (
          <SwaggerInput
            swaggerUrl={swaggerUrl}
            onUrlChange={setSwaggerUrl}
            swaggerContent={swaggerContent}
            onContentChange={setSwaggerContent}
          />
        ) : (
          <FileUploadComponent
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            onClear={() => setSelectedFile(null)}
          />
        )}
      </div>

      {enabledStandards.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          No standards are enabled. Go to the Standards page to enable some
          before running verification.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={!canSubmit || loading || enabledStandards.length === 0}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileSearch className="h-4 w-4" />
            Run Verification
          </>
        )}
      </button>

      {report && <VerificationReportView report={report} />}
    </div>
  );
}
