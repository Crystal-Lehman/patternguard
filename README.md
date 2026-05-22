# PatternGuard

Architecture Standards Validator — Upload diagrams or paste Swagger/OpenAPI links to verify your architecture against established standards with AI-powered analysis.

## Features

- **Upload Architecture Diagrams** — PNG, JPG, SVG, WebP, or PDF. AI vision analyzes the diagram against your standards.
- **Paste Swagger/OpenAPI Links** — Provide a URL or paste the spec directly. The tool parses and validates against your standards.
- **Custom Standards Management** — Define, edit, enable/disable, and categorize architecture standards by severity (critical, warning, info).
- **Built-in Best Practices** — Start with 18 pre-configured standards covering Security, Performance, Reliability, Scalability, Observability, API Design, and more.
- **AI Recommendations** — Get AI-suggested standards to fill gaps in your current set.
- **Compliance Reports** — Detailed pass/fail/warning results for each standard with actionable improvement suggestions.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `LITELLM_API_KEY` | API key for the LiteLLM / OpenAI-compatible endpoint | Yes |
| `LITELLM_BASE_URL` | Base URL for the API (defaults to `https://api.openai.com/v1`) | No |
| `LITELLM_MODEL` | Model to use (defaults to `gpt-4o`) | No |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Architecture

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** for styling
- **OpenAI SDK** (compatible with LiteLLM proxy) for AI analysis
- **Client-side standards storage** via localStorage

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Swagger/diagram analysis endpoint
│   │   └── recommend/route.ts  # AI standards recommendations endpoint
│   ├── standards/page.tsx      # Standards management page
│   ├── verify/page.tsx         # Verification page
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── FileUpload.tsx          # Drag & drop file upload
│   ├── SwaggerInput.tsx        # URL input + paste area
│   ├── StandardForm.tsx        # Add/edit standard modal
│   └── VerificationReport.tsx  # Compliance report display
└── lib/
    ├── types.ts                # TypeScript type definitions
    ├── default-standards.ts    # Built-in architecture standards
    ├── standards-context.tsx   # React context for standards state
    └── ai-client.ts            # LiteLLM/OpenAI client
```
