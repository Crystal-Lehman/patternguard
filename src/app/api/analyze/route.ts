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
        if (swaggerUrl.includes("#")) {
          return NextResponse.json(
            {
              error:
                "This looks like a Swagger UI page URL (contains #). Please provide the raw spec URL instead (e.g., ending in /swagger.json or /openapi.json), or paste the spec content directly.",
            },
            { status: 400 }
          );
        }

        let response: Response;
        try {
          response = await fetch(swaggerUrl, {
            headers: { Accept: "application/json, application/yaml, text/yaml" },
          });
        } catch {
          return NextResponse.json(
            {
              error:
                "Could not connect to the Swagger URL. The server may be behind a VPN, firewall, or require authentication. Try pasting the spec content directly instead.",
            },
            { status: 400 }
          );
        }

        if (!response.ok) {
          const hint =
            response.status === 401 || response.status === 403
              ? " The server requires authentication. Try copying the raw spec JSON from your browser and pasting it directly."
              : "";
          return NextResponse.json(
            {
              error: `Failed to fetch Swagger spec (HTTP ${response.status} ${response.statusText}).${hint}`,
            },
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
