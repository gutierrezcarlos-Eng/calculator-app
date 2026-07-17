# Full Prompt History

This document lists the prompts used during the development of the Full‑Stack Calculator application, organised by development phase.

## 1. Requirements Clarification & Planning

- "General requirements for a new project: build a full‑stack calculator application with a React/TypeScript frontend and a Go REST API backend. Features: addition, subtraction, multiplication, division, exponentiation, square root, percentage. Non‑functional: clean, readable code, unit tests, documentation, optional Docker."
- "Which frontend options are available (React with Vite vs. CRA, state management, styling) and what are their trade‑offs?"
- "What software must be installed on the developer machine (Go, Node.js, Docker)?"

## 2. Backend Architecture & Implementation

- "Create a Go backend with a REST API. Each arithmetic operation should have its own endpoint (e.g., `/api/v1/add`, `/api/v1/sqrt`)."
- "Refactor the backend code into separate packages: `pkg/calculator` for the calculation logic and `handlers` for HTTP handling."
- "Add CORS middleware and a logging middleware that only logs when the `DEBUG` environment variable is set to `true`."
- "Add a health‑check endpoint (`/api/v1/health`) that returns `{"status":"ok"}`."
- "Write unit tests for the calculator package and for each HTTP handler. Use table‑driven tests and `httptest`."
- "Generate a coverage report in Go"

## 3. Frontend Architecture & Implementation

- "Scaffold a React + TypeScript project using Vite. Use a custom hook (`useCalculator`) to manage all calculator state and API calls, leaving the components presentational."
- "Design the button layout as follows: row 1 – CE, C (span 2), ←; row 2 – √, xʸ, %, +; rows 3‑5 – digits and operators; row 6 – ±, 0, ., =."
- "Add full keyboard support. Map keys to the corresponding calculator functions and extract the logic into a `useKeyboard` hook."
- "Make the calculator responsive: it must not resize when long expressions are shown; text should wrap inside the display area."
- "Show exponentiation results with a superscript in the expression (e.g., 2³ = 8)."
- "Implement a ± button that toggles the sign of the current operand. Ensure it works correctly for the second operand after an operator is pressed."
- "Limit manual digit input to 16 characters. If a calculation result exceeds 16 characters, display an 'Overflow' error."
- "When a calculation fails (e.g., division by zero), show the attempted operation in the expression area (e.g., '5 ÷ 0 = Error') and reset the display to 0."

## 4. Integration & API Alignment

- "Update the frontend API service (`api.ts`) to call the new per‑operation backend endpoints instead of the old single `/calculate` route. For binary operations, use URLs like `/api/v1/add?operand1=…&operand2=…`; for unary operations, use `/api/v1/sqrt?operand1=…`."
- "Ensure that environment variables (`VITE_API_BASE`, `VITE_API_PREFIX`) are used consistently and fall back to sensible defaults (`http://localhost:8080`, `/api/v1`) when not set."
- "Create a `.env.production` file documenting the required frontend environment variables so other developers can quickly configure the project."
- "Verify that the new per‑operation routes work correctly with the frontend"
- "Test the health endpoint (`/api/v1/health`) both from the browser and via `curl` to confirm the backend is reachable."
- "Troubleshoot a 'Failed to fetch' error that occurred after the backend refactoring. The root cause was a mismatch between the old and new URL patterns; the frontend was still sending requests to the deprecated `/api/v1/calculate` endpoint. The fix involved updating the URL construction logic in `api.ts` and verifying that the backend routes are correctly registered under the `/api/v1/` prefix."
- "Confirm that CORS headers are correctly served by the backend middleware for all new endpoints, allowing the frontend to make cross‑origin requests without issues."
- "Update the Postman collection (if used) to include examples for each per‑operation endpoint, facilitating independent API testing."

## 5. Testing & Quality Assurance

- "Write unit tests for the `useCalculator` hook using React Testing Library and Vitest."
- "Write tests for the `api.ts` service, mocking the global `fetch` function."
- "Create component tests for the `ButtonPanel`, `Display`, and `ErrorBoundary` components."
- "Add tests for keyboard input (digit keys, operator keys, Escape, Backspace, etc.)."
- "Cover edge cases: dot input when waiting for second operand, chaining operators, overflow in sqrt and binary operations, superscript error expression for power, method‑not‑allowed HTTP 405."

## 6. Polish & Best Practices

- "Create a React error boundary component to catch rendering crashes."
- "Generate a custom SVG favicon – a thin, blue calculator icon."
- "Write a comprehensive `README.md` with project structure, setup instructions, API examples, design decisions, and assumptions."
- "Compile a comprehensive list of all AI prompts used throughout the project, organised by development phase (requirements, backend, frontend, integration, testing, polish). Include a concise version for the README and a detailed, full‑length version for a separate `PROMPTS.md` file.
