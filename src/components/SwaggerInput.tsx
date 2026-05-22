"use client";

import { useState } from "react";
import { Link2, FileJson, ChevronDown, ChevronUp } from "lucide-react";

interface SwaggerInputProps {
  swaggerUrl: string;
  onUrlChange: (url: string) => void;
  swaggerContent: string;
  onContentChange: (content: string) => void;
}

export default function SwaggerInput({
  swaggerUrl,
  onUrlChange,
  swaggerContent,
  onContentChange,
}: SwaggerInputProps) {
  const [showPasteArea, setShowPasteArea] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="url"
          value={swaggerUrl}
          onChange={(e) => {
            onUrlChange(e.target.value);
            if (e.target.value) onContentChange("");
          }}
          placeholder="https://api.example.com/swagger.json"
          className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <button
        onClick={() => setShowPasteArea(!showPasteArea)}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <FileJson className="h-4 w-4" />
        Or paste spec content directly
        {showPasteArea ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {showPasteArea && (
        <textarea
          value={swaggerContent}
          onChange={(e) => {
            onContentChange(e.target.value);
            if (e.target.value) onUrlChange("");
          }}
          placeholder="Paste your OpenAPI/Swagger JSON or YAML here..."
          rows={8}
          className="w-full rounded-xl border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      )}
    </div>
  );
}
