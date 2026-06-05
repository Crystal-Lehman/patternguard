"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Link2,
  Trash2,
  Upload,
} from "lucide-react";
import VerificationReportView from "@/components/VerificationReport";
import { useHistory } from "@/lib/history-context";
import type { VerificationReport } from "@/lib/types";

function scoreFor(report: VerificationReport): number {
  const { summary } = report;
  return summary.total > 0
    ? Math.round(
        ((summary.passed + summary.notApplicable) / summary.total) * 100
      )
    : 0;
}

function scoreColor(score: number): string {
  return score >= 80
    ? "text-emerald-600"
    : score >= 60
      ? "text-amber-600"
      : "text-red-600";
}

export default function VerificationHistory() {
  const { history, deleteReport, clearHistory } = useHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = history.find((r) => r.id === selectedId) ?? null;

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </button>
        <VerificationReportView report={selected} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <Clock className="h-8 w-8 text-zinc-400" />
        <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No verification history yet
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Past verification runs will appear here so you can review them later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {history.length} saved {history.length === 1 ? "run" : "runs"}
        </p>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
          Clear all
        </button>
      </div>

      <ul className="space-y-2">
        {history.map((report) => {
          const score = scoreFor(report);
          const Icon = report.inputType === "swagger" ? Link2 : Upload;
          return (
            <li
              key={report.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <button
                onClick={() => setSelectedId(report.id)}
                className="flex flex-1 items-center gap-3 text-left min-w-0"
              >
                <span className={`text-2xl font-bold ${scoreColor(score)}`}>
                  {score}%
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                    <span className="truncate">{report.inputName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {new Date(report.timestamp).toLocaleString()} &middot;{" "}
                    {report.summary.passed} passed, {report.summary.failed} failed,{" "}
                    {report.summary.warnings} warnings
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (selectedId === report.id) setSelectedId(null);
                  deleteReport(report.id);
                }}
                aria-label="Delete report"
                className="flex-shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
