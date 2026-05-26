import { Standard } from "./types";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_STANDARDS: Standard[] = [
  // Security
  {
    id: uuidv4(),
    name: "HTTPS Required",
    description: "All API endpoints must use HTTPS (TLS) for transport security.",
    category: "Security",
    severity: "critical",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Authentication Required",
    description:
      "All endpoints (except health checks and public docs) must require authentication via API key, OAuth2, or JWT.",
    category: "Security",
    severity: "critical",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Input Validation",
    description:
      "All request parameters and body fields must have defined types, formats, and constraints (min/max length, patterns, enums).",
    category: "Security",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "No Sensitive Data in URLs",
    description:
      "Sensitive information (passwords, tokens, SSN) must not appear in URL path or query parameters.",
    category: "Security",
    severity: "critical",
    enabled: true,
  },

  // API Design
  {
    id: uuidv4(),
    name: "Consistent Naming Convention",
    description:
      "API paths must use kebab-case. Request/response fields must use camelCase or snake_case consistently.",
    category: "API Design",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Proper HTTP Methods",
    description:
      "APIs must use appropriate HTTP methods: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for removals.",
    category: "API Design",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Versioned API",
    description:
      "API paths should include a version prefix (e.g., /v1/, /v2/) to support backward compatibility.",
    category: "API Design",
    severity: "info",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Standard Error Responses",
    description:
      "All endpoints must define error response schemas (4xx, 5xx) with consistent error format including code, message, and details.",
    category: "API Design",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Pagination Support",
    description:
      "List endpoints returning collections must support pagination via limit/offset or cursor-based parameters.",
    category: "API Design",
    severity: "info",
    enabled: true,
  },

  // Reliability
  {
    id: uuidv4(),
    name: "Health Check Endpoint",
    description:
      "Services must expose a /health or /healthz endpoint that returns service status without authentication.",
    category: "Reliability",
    severity: "critical",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Rate Limiting",
    description:
      "APIs must implement rate limiting with appropriate headers (X-RateLimit-Limit, X-RateLimit-Remaining).",
    category: "Reliability",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Timeout Configuration",
    description:
      "All external service calls and database queries must have explicit timeout configurations.",
    category: "Reliability",
    severity: "warning",
    enabled: true,
  },

  // Performance
  {
    id: uuidv4(),
    name: "Response Compression",
    description:
      "APIs should support gzip/deflate compression for responses larger than 1KB.",
    category: "Performance",
    severity: "info",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Caching Headers",
    description:
      "GET endpoints for static or semi-static data must include Cache-Control headers.",
    category: "Performance",
    severity: "info",
    enabled: true,
  },

  // Observability
  {
    id: uuidv4(),
    name: "Request Tracing",
    description:
      "Services must propagate and log correlation/trace IDs (e.g., X-Request-ID) for distributed tracing.",
    category: "Observability",
    severity: "warning",
    enabled: true,
  },
  {
    id: uuidv4(),
    name: "Structured Logging",
    description:
      "All services must use structured logging (JSON format) with standard fields: timestamp, level, service, traceId.",
    category: "Observability",
    severity: "info",
    enabled: true,
  },

  // Data Management
  {
    id: uuidv4(),
    name: "Data Classification",
    description:
      "API specifications must document data sensitivity levels (public, internal, confidential, restricted) for all fields.",
    category: "Data Management",
    severity: "info",
    enabled: true,
  },

  // Scalability
  {
    id: uuidv4(),
    name: "Stateless Design",
    description:
      "Services must be stateless — no server-side sessions. All state must be stored externally (database, cache, etc.).",
    category: "Scalability",
    severity: "warning",
    enabled: true,
  },
];
