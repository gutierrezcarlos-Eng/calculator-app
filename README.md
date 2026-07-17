# Full-Stack Calculator

A calculator application with a **React / TypeScript** frontend and a **Go** REST API backend.  
The frontend calls the backend for every calculation, supporting basic and advanced operations.

## Features

- **Basic operations:** addition, subtraction, multiplication, division
- **Advanced operations:** exponentiation (xʸ), square root (√), percentage (a% of b)
- **Clean, responsive UI** – works on desktop and mobile, no layout jumps
- **Full keyboard support** – all buttons can be triggered with the keyboard
- **Input validation and error handling** – division by zero, overflow, invalid input
- **Backend per‑operation REST endpoints** with API versioning (`/api/v1/…`)
- **Middleware** – CORS, debug‑mode request logging, and a health‑check endpoint
- **High test coverage** for both layers (unit tests, component tests, API tests)
- **Docker support** – run the full stack with a single command (optional)

## Project Structure

```
calculator-app/
├── backend/
│   ├── main.go                    # entry point, routes & middleware
│   ├── go.mod
│   ├── handlers/
│   │   ├── binary.go              # add, subtract, multiply, divide, pow, percent
│   │   ├── unary.go               # sqrt
│   │   ├── health.go              # /health endpoint
│   │   ├── middleware.go          # CORS + logging middleware
│   │   └── handlers_test.go       # HTTP handler tests
│   └── pkg/
│       └── calculator/
│           ├── calculator.go      # pure calculation logic
│           └── calculator_test.go # unit tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calculator.tsx
│   │   │   ├── ButtonPanel.tsx
│   │   │   ├── Display.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Calculator.test.tsx
│   │   │   └── ButtonPanel.test.tsx
│   │   ├── hooks/
│   │   │   ├── useCalculator.ts   # state machine & API calls
│   │   │   └── useKeyboard.ts     # keyboard event handling
│   │   ├── services/
│   │   │   ├── api.ts             # fetch wrapper for backend
│   │   │   └── api.test.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── App.test.tsx
│   │   ├── main.tsx
│   │   └── test-setup.ts
│   ├── .env.example
│   ├── vite.config.ts
│   └── vitest.config.ts
├── docker-compose.yml (optional)
└── README.md
```

## Setup & Running

### Prerequisites

You only need these installed on your machine to run the project:

| Software    | Minimum Version   | Why                                       |
| ----------- | ----------------- | ----------------------------------------- |
| **Go**      | 1.21              | Build and run the backend API             |
| **Node.js** | 18 (LTS)          | Run the React frontend (includes npm)     |
| **Docker**  | 20.10+ (optional) | Run the whole stack with a single command |

> A code editor (VS Code, GoLand, etc.) is recommended for exploring the code, but not required to follow the setup steps.

### 1. Backend (Go REST API)

```bash
cd backend
go run .
# Server starts on http://localhost:8080
```

To enable request logging (useful for debugging), set the `DEBUG` environment variable:

```bash
# Windows PowerShell
$env:DEBUG="true"
go run .

# Linux / macOS
DEBUG=true go run .
```

Run tests and generate a coverage report:

```bash
# Tests + Coverage
go test ./... -coverprofile=coverage.out
go tool cover -func coverage.out
go tool cover -html coverage.out -o coverage.html
```

### 2. Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

The frontend expects the backend at `http://localhost:8080` by default.  
You can override this by creating a `.env` file:

```env
VITE_API_BASE=http://localhost:8080
VITE_API_PREFIX=/api/v1
```

Run tests and generate a coverage report:

```bash
npx vitest --coverage
```

### 3. Docker (optional)

```bash
docker compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Health check: http://localhost:8080/api/v1/health
```

## API Examples (v1)

All endpoints use **GET** and return JSON.

| Operation              | Endpoint                                  | Example Response                                 |
| ---------------------- | ----------------------------------------- | ------------------------------------------------ |
| Add                    | `/api/v1/add?operand1=5&operand2=3`       | `{"result":8}`                                   |
| Subtract               | `/api/v1/subtract?operand1=10&operand2=4` | `{"result":6}`                                   |
| Multiply               | `/api/v1/multiply?operand1=6&operand2=7`  | `{"result":42}`                                  |
| Divide                 | `/api/v1/divide?operand1=15&operand2=3`   | `{"result":5}`                                   |
| Divide by zero         | `/api/v1/divide?operand1=1&operand2=0`    | `400 {"error":"division by zero"}`               |
| Power                  | `/api/v1/pow?operand1=2&operand2=10`      | `{"result":1024}`                                |
| Square root            | `/api/v1/sqrt?operand1=25`                | `{"result":5}`                                   |
| Square root (negative) | `/api/v1/sqrt?operand1=-9`                | `400 {"error":"square root of negative number"}` |
| Percentage             | `/api/v1/percent?operand1=20&operand2=80` | `{"result":16}`                                  |
| Health check           | `/api/v1/health`                          | `{"status":"ok"}`                                |

### Error response format

```json
{
  "error": "division by zero"
}
```

## Keyboard Shortcuts

| Key(s)               | Action                |
| -------------------- | --------------------- |
| `0`–`9`              | Digit input           |
| `.`                  | Decimal point         |
| `+`                  | Add                   |
| `-`                  | Subtract              |
| `*`                  | Multiply              |
| `/`                  | Divide                |
| `%`                  | Percent               |
| `^`                  | Power (xʸ)            |
| `r` or `R`           | Square root (√)       |
| `n` or `N`           | Negate (±)            |
| `Enter` or `=`       | Equals                |
| `Backspace`          | Delete last digit (←) |
| `Delete`             | Clear entry (CE)      |
| `Escape`, `c` or `C` | Clear all             |

## Design Decisions

### Backend

- **Go standard library only** – The API uses `net/http` with a sub‑router for versioning (`/api/v1/`). No external frameworks keep the build small and dependencies minimal.

- **Per‑operation endpoints** – Each arithmetic operation has its own route (e.g., `/add`, `/sqrt`). This makes the API RESTful, easy to document, and each endpoint can be tested independently.

- **Middleware pattern** – Cross‑cutting concerns like CORS and request logging are implemented as composable middleware. Handlers stay focused on business logic, and middleware can be easily added or removed.

- **Package separation** – Core calculation logic lives in `pkg/calculator` and is unit‑tested in isolation. HTTP handlers are in a separate handlers package, creating a clean separation between business logic and transport.

- **Result formatting** – The backend rounds results to 16 decimal places and returns a clear "overflow" error when a result is infinite or not a number `(NaN)`.

### Frontend

- **Custom hook for state management** – The `useCalculator` hook encapsulates all calculator logic (display, pending operations, API calls). The UI components are purely presentational, making them easy to test and reuse.

- **Per‑operation API service** – `api.ts` builds the correct URL for each operation; only the hook depends on it, making the data layer swappable.

- **Keyboard support extracted into a custom hook** – `useKeyboard` handles all keyboard events separately, keeping `Calculator.tsx` lean and making the keyboard logic testable in isolation.

- **Responsive design** – The calculator uses relative units (`em`,`%`) and the CSS `clamp()` function. It adapts to mobile screens without fixed breakpoints, and the layout never resizes unexpectedly.

- **Defensive programming** – The calculator limits manual input to 16 digits, rejects overflow and infinite results, and wraps long expressions in the display to prevent layout shifts.

- **Error boundary** – A React error boundary wraps the calculator to catch rendering crashes and show a fallback message instead of a blank screen.

## Assumptions

- The **percentage** operation is interpreted as _a% of b_ (e.g., 20% of 80 = 16).
- **Square root** ignores the second operand; only `operand1` is used.
- The calculator is a **chain calculator** – operations are performed sequentially as the user presses them (no operator precedence). This mimics most basic physical calculators.
- Results are displayed with up to **16 characters**. Longer results (or those exceeding the backend’s rounding precision) trigger an **Overflow** error.
- The display never shows scientific notation; all numbers are formatted as plain decimals.
- The frontend disables digit input after 16 digits, but the `±` sign can still be toggled.

## Coverage

- **Backend:** Run `go test ./... -coverprofile=coverage.out` from the `backend/` folder. The overall statement coverage is **>80%** (the `main.go` file is only responsible for wiring and is intentionally untested).
- **Frontend:** Run `npx vitest --coverage` from the `frontend/` folder. Statement coverage is **>90%** across all components, hooks, and services.
- Detailed HTML reports can be generated for both layers as shown in the [Setup & Running](#setup--running) section.

## Prompts Used

The development process was assisted by an AI tool. The following list summarises the main prompts used, grouped by project phase.

### Requirements & Planning

- "General requirements for a new project: build a full-stack calculator with a React frontend and a Go backend. Functional operations: addition, subtraction, multiplication, division, exponentiation, square root, percentage. Non-functional: clean, readable code; unit tests; documentation."
- "Evaluate frontend technology options (Vite vs. Create React App) and state management approaches (React hooks vs. Redux)."
- "List the software prerequisites needed on a developer machine to run the project."

### Backend Development

- "Create a Go REST API with separate endpoints for each calculator operation (e.g., `/add`, `/sqrt`)."
- "Refactor the backend into packages: `pkg/calculator` for business logic and `handlers` for HTTP routing."
- "Add middleware for CORS handling and request logging. Make logging conditional on a `DEBUG` environment variable."
- "Implement a health-check endpoint at `/api/v1/health`."
- "Write unit tests for the calculation logic and HTTP handlers, using table-driven tests and `httptest`."

### Frontend Development

- "Scaffold a React + TypeScript project with Vite. Use a custom hook (`useCalculator`) to separate UI from calculator state and API calls."
- "Design the button panel layout as specified: top row with CE, C, ←; operations in a right-side column; power button with superscript (xʸ)."
- "Add full keyboard support. Extract keyboard handling into a dedicated `useKeyboard` hook."
- "Implement responsive design: the calculator must never resize; long expressions should wrap inside the display area."
- "Display superscript for exponentiation in the expression after pressing equals."
- "Handle negative numbers: add a ± button that toggles sign for the current operand."
- "Limit manual input to 16 digits. Show an Overflow error for results exceeding the display limit."

### Integration & Testing

- "Write component tests for Calculator, ButtonPanel, Display, and ErrorBoundary using React Testing Library and Vitest."
- "Increase frontend test coverage to >90% by covering edge cases (dot handling, chaining, overflow, sqrt of negative)."
- "Write tests for the API service (with mocked fetch) and for the keyboard hook."
- "Ensure backend tests cover each endpoint and the middleware."

### Polish & Documentation

- "Create a React ErrorBoundary to catch rendering crashes."
- "Add a `.env.example` file documenting required environment variables."
- "Generate a README with project structure, setup instructions, API examples, design decisions, and assumptions."
- "Provide a summary of AI prompts used for the README and a separate `PROMPTS.md` file."

A complete, detailed list of all prompts is available in `PROMPTS.md`.

- **Backend coverage:** [backend/coverage.html](backend/coverage.html)
- **Frontend coverage:** [frontend/coverage/index.html](frontend/coverage/index.html)
