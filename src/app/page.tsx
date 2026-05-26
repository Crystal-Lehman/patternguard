import Link from "next/link";
import { Shield, FileSearch, Settings, Sparkles, Upload, Link2 } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-blue-100 p-4 dark:bg-blue-950">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          PatternGuard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Verify your architecture against established standards. Upload
          diagrams or paste Swagger links and get AI-powered compliance analysis
          with actionable recommendations.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/verify"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FileSearch className="h-4 w-4" />
            Start Verification
          </Link>
          <Link
            href="/standards"
            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Settings className="h-4 w-4" />
            Manage Standards
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Upload,
            title: "Upload Diagrams",
            description:
              "Upload architecture diagrams in PNG, JPG, SVG, or PDF format. AI vision analyzes the diagram against your standards.",
          },
          {
            icon: Link2,
            title: "Paste Swagger Links",
            description:
              "Provide a Swagger/OpenAPI URL or paste the spec directly. The tool parses and validates against your standards.",
          },
          {
            icon: Settings,
            title: "Custom Standards",
            description:
              "Define your own architecture standards by category and severity. Start with built-in best practices and customize from there.",
          },
          {
            icon: FileSearch,
            title: "Compliance Reports",
            description:
              "Get detailed pass/fail reports for each standard with specific findings and improvement suggestions.",
          },
          {
            icon: Sparkles,
            title: "AI Recommendations",
            description:
              "AI suggests new standards based on your existing set and provides context-aware improvement recommendations.",
          },
          {
            icon: Shield,
            title: "Best Practice Library",
            description:
              "Start with 18 built-in standards covering security, performance, reliability, scalability, and more.",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
