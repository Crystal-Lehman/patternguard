import { NextRequest, NextResponse } from "next/server";
import { analyzeSwaggerSpec, analyzeDiagram } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inputType = formData.get("inputType") as string;
    const standardsJson = formData.get("standards") as string;

    if (!standardsJson) {
      return NextResponse.json(
        { error: "Standards are required" },
        { status: 400 }
      );
    }

    const standards = JSON.parse(standardsJson);

    if (inputType === "swagger") {
      const swaggerUrl = formData.get("swaggerUrl") as string;
      const swaggerContent = formData.get("swaggerContent") as string;

      let specContent: string;

      if (swaggerContent) {
        specContent = swaggerContent;
      } else if (swaggerUrl) {
        const response = await fetch(swaggerUrl);
        if (!response.ok) {
          return NextResponse.json(
            { error: `Failed to fetch Swagger spec from URL: ${response.statusText}` },
            { status: 400 }
          );
        }
        specContent = await response.text();
      } else {
        return NextResponse.json(
          { error: "Either swaggerUrl or swaggerContent is required" },
          { status: 400 }
        );
      }

      const result = await analyzeSwaggerSpec(specContent, standards);
      return NextResponse.json(result);
    } else if (inputType === "diagram") {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json(
          { error: "Diagram file is required" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/png";

      const result = await analyzeDiagram(base64, mimeType, standards);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid input type. Must be 'swagger' or 'diagram'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
