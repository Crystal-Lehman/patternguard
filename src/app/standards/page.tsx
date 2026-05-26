"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Sparkles,
  Loader2,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useStandards } from "@/lib/standards-context";
import StandardForm from "@/components/StandardForm";
import type { Standard, StandardCategory, AIRecommendation } from "@/lib/types";

const SEVERITY_BADGE = {
  critical: {
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    icon: Shield,
  },
  warning: {
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    icon: AlertTriangle,
  },
  info: {
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    icon: Info,
  },
};

const CATEGORY_COLORS: Record<StandardCategory, string> = {
  Security: "bg-red-500",
  Performance: "bg-orange-500",
  Reliability: "bg-emerald-500",
  Scalability: "bg-purple-500",
  Observability: "bg-cyan-500",
  "API Design": "bg-blue-500",
  "Data Management": "bg-yellow-500",
  General: "bg-zinc-500",
};

export default function StandardsPage() {
  const {
    standards,
    addStandard,
    updateStandard,
    deleteStandard,
    toggleStandard,
    resetToDefaults,
  } = useStandards();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Standard | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const filtered =
    filterCategory === "all"
      ? standards
      : standards.filter((s) => s.category === filterCategory);

  const categories = Array.from(new Set(standards.map((s) => s.category)));

  const handleGetRecommendations = async () => {
    setLoadingRecs(true);
    setRecError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standards: standards.map((s) => ({
            name: s.name,
            description: s.description,
            category: s.category,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get recommendations");
      }
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAddRecommendation = (rec: AIRecommendation) => {
    addStandard({
      id: crypto.randomUUID(),
      name: rec.name,
      description: rec.description,
      category: rec.category as StandardCategory,
      severity: rec.severity as "critical" | "warning" | "info",
      enabled: true,
    });
    setRecommendations((prev) => prev.filter((r) => r.name !== rec.name));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Architecture Standards
          </h1>
          <p className="text-sm text-zinc-500">
            {standards.length} standards &middot;{" "}
            {standards.filter((s) => s.enabled).length} enabled
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGetRecommendations}
            disabled={loadingRecs}
            className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
          >
            {loadingRecs ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Recommendations
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Standard
          </button>
        </div>
      </div>

      {recError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {recError}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              AI-Recommended Standards
            </h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.name}
                className="flex items-start gap-3 rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-800 dark:bg-zinc-900"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {rec.name}
                  </p>
                  <p className="text-sm text-zinc-500">{rec.description}</p>
                  <p className="mt-1 text-xs italic text-purple-600 dark:text-purple-400">
                    {rec.rationale}
                  </p>
                </div>
                <button
                  onClick={() => handleAddRecommendation(rec)}
                  className="flex-shrink-0 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory("all")}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filterCategory === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          All ({standards.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterCategory === cat
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[cat as StandardCategory] || "bg-zinc-500"}`}
            />
            {cat} ({standards.filter((s) => s.category === cat).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((standard) => {
          const badge = SEVERITY_BADGE[standard.severity];
          const BadgeIcon = badge.icon;
          return (
            <div
              key={standard.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                standard.enabled
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                  : "border-zinc-100 bg-zinc-50/50 opacity-60 dark:border-zinc-900 dark:bg-zinc-950/50"
              }`}
            >
              <button
                onClick={() => toggleStandard(standard.id)}
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  standard.enabled
                    ? "border-blue-600 bg-blue-600"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {standard.enabled && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {standard.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {standard.severity}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${CATEGORY_COLORS[standard.category] || "bg-zinc-500"}`}
                    />
                    {standard.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {standard.description}
                </p>
              </div>

              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => {
                    setEditing(standard);
                    setShowForm(true);
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteStandard(standard.id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500">
            No standards found. Add one or reset to defaults.
          </p>
        </div>
      )}

      {showForm && (
        <StandardForm
          initial={editing}
          onSave={(standard) => {
            if (editing) {
              updateStandard(standard);
            } else {
              addStandard(standard);
            }
            setShowForm(false);
            setEditing(undefined);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}
    </div>
  );
}
