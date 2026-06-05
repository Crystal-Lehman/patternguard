import OpenAI from "openai";

function getClient(): OpenAI {
  const apiKey = process.env.LITELLM_API_KEY;
  const rawURL = process.env.LITELLM_BASE_URL || "https://api.openai.com/v1";
  const baseURL = rawURL.replace(/\/ui\/?$/, "");

  if (!apiKey) {
    throw new Error(
      "LITELLM_API_KEY is not configured. Set it in your environment variables."
    );
  }

  return new OpenAI({ apiKey, baseURL });
}

const MODEL = process.env.LITELLM_MODEL || "gpt-4o";

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text;
}

export async function analyzeSwaggerSpec(
  specContent: string,
  standards: { name: string; description: string; category: string; severity: string }[]
): Promise<{
  results: {
    standardName: string;
    status: "pass" | "fail" | "warning" | "not_applicable";
    details: string;
    suggestion?: string;
  }[];
  recommendations: string[];
}> {
  const client = getClient();

  const standardsList = standards
    .map((s, i) => `${i + 1}. [${s.category}/${s.severity}] ${s.name}: ${s.description}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert architecture reviewer. Analyze the given OpenAPI/Swagger specification against the provided architecture standards. For each standard, determine if it passes, fails, has warnings, or is not applicable. Provide specific details about what was found and suggestions for improvement when needed.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "results": [
    {
      "standardName": "exact standard name",
      "status": "pass" | "fail" | "warning" | "not_applicable",
      "details": "specific explanation of what was found",
      "suggestion": "improvement suggestion if status is fail or warning"
    }
  ],
  "recommendations": [
    "additional architecture recommendation not covered by existing standards"
  ]
}`,
      },
      {
        role: "user",
        content: `## Architecture Standards to Check:\n${standardsList}\n\n## OpenAPI Specification:\n${specContent}`,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  return JSON.parse(extractJSON(content));
}

export async function analyzeDiagram(
  imageBase64: string,
  mimeType: string,
  standards: { name: string; description: string; category: string; severity: string }[]
): Promise<{
  results: {
    standardName: string;
    status: "pass" | "fail" | "warning" | "not_applicable";
    details: string;
    suggestion?: string;
  }[];
  recommendations: string[];
}> {
  const client = getClient();

  const standardsList = standards
    .map((s, i) => `${i + 1}. [${s.category}/${s.severity}] ${s.name}: ${s.description}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert architecture reviewer. Analyze the given architecture diagram against the provided architecture standards. For each standard, determine if it passes, fails, has warnings, or is not applicable based on what you can observe in the diagram. Provide specific details about what was found and suggestions for improvement when needed.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "results": [
    {
      "standardName": "exact standard name",
      "status": "pass" | "fail" | "warning" | "not_applicable",
      "details": "specific explanation of what was observed in the diagram",
      "suggestion": "improvement suggestion if status is fail or warning"
    }
  ],
  "recommendations": [
    "additional architecture recommendation based on what you see in the diagram"
  ]
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text" as const,
            text: `## Architecture Standards to Check:\n${standardsList}\n\nPlease analyze this architecture diagram against the standards listed above.`,
          },
          {
            type: "image_url" as const,
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  return JSON.parse(extractJSON(content));
}

export async function recommendStandards(
  existingStandards: { name: string; description: string; category: string }[]
): Promise<{
  recommendations: {
    name: string;
    description: string;
    category: string;
    severity: string;
    rationale: string;
  }[];
}> {
  const client = getClient();

  const existingList = existingStandards
    .map((s, i) => `${i + 1}. [${s.category}] ${s.name}: ${s.description}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert software architect. Based on the existing architecture standards, suggest additional standards that are commonly considered best practices but are not yet covered. Focus on gaps in the current standards.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "recommendations": [
    {
      "name": "Standard Name",
      "description": "Detailed description of the standard",
      "category": "Security" | "Performance" | "Reliability" | "Scalability" | "Observability" | "API Design" | "Data Management" | "General",
      "severity": "critical" | "warning" | "info",
      "rationale": "Why this standard is important and what gap it fills"
    }
  ]
}

Suggest 3-5 high-value standards that complement the existing set.`,
      },
      {
        role: "user",
        content: `## Existing Standards:\n${existingList}\n\nPlease recommend additional architecture standards that would complement this set.`,
      },
    ],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  return JSON.parse(extractJSON(content));
}
