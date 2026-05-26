"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { VerificationReport as Report, VerificationResult } from "@/lib/types";

const STATUS_CONFIG = {
  pass: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Pass",
  },
  fail: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    label: "Fail",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    label: "Warning",
  },
  not_applicable: {
    icon: MinusCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-900",
    border: "border-zinc-200 dark:border-zinc-800",
    label: "N/A",
  },
};

function ResultCard({ result }: { result: VerificationResult }) {
  const [expanded, setExpanded] = useState(
    result.status === "fail" || result.status === "warning"
  );
  const config = STATUS_CONFIG[result.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {result.standardName}
          </p>
          <p className="text-xs text-zinc-500">{result.category}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}
        >
          {config.label}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-inherit px-4 py-3 space-y-2">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.details}</p>
          {result.suggestion && (
            <div className="flex gap-2 rounded-lg bg-white/60 p-2 dark:bg-zinc-800/60">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VerificationReportProps {
  report: Report;
}

export default function VerificationReportView({
  report,
}: VerificationReportProps) {
  const { summary } = report;
  const score = summary.total > 0
    ? Math.round(((summary.passed + summary.notApplicable) / summary.total) * 100)
    : 0;

  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Verification Results
          </h3>
          <p className="text-sm text-zinc-500">
            {report.inputName} &middot;{" "}
            {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-4xl font-bold ${scoreColor}`}>{score}%</p>
          <p className="text-xs text-zinc-500">Compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Passed", value: summary.passed, color: "text-emerald-600" },
          { label: "Failed", value: summary.failed, color: "text-red-600" },
          { label: "Warnings", value: summary.warnings, color: "text-amber-600" },
          { label: "N/A", value: summary.notApplicable, color: "text-zinc-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {report.aiRecommendations && report.aiRecommendations.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              AI Recommendations
            </h4>
          </div>
          <ul className="space-y-1.5">
            {report.aiRecommendations.map((rec, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-blue-800 dark:text-blue-300"
              >
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {report.results
          .sort((a, b) => {
            const order = { fail: 0, warning: 1, pass: 2, not_applicable: 3 };
            return order[a.status] - order[b.status];
          })
          .map((result, i) => (
            <ResultCard key={i} result={result} />
          ))}
      </div>
    </div>
  );
}
