package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAddHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/add?operand1=5&operand2=3", nil)
	rec := httptest.NewRecorder()
	AddHandler(rec, req)

	res := rec.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var body Result
	json.NewDecoder(res.Body).Decode(&body)
	if body.Result != 8 {
		t.Errorf("expected 8, got %f", body.Result)
	}
}

func TestBinaryHandlers(t *testing.T) {
	tests := []struct {
		name       string
		handler    func(http.ResponseWriter, *http.Request)
		url        string
		wantStatus int
		wantResult float64
		wantError  string
	}{
		// Success cases
		{"add", AddHandler, "/add?operand1=1&operand2=2", http.StatusOK, 3, ""},
		{"subtract", SubtractHandler, "/subtract?operand1=5&operand2=3", http.StatusOK, 2, ""},
		{"multiply", MultiplyHandler, "/multiply?operand1=2&operand2=3", http.StatusOK, 6, ""},
		{"divide", DivideHandler, "/divide?operand1=6&operand2=2", http.StatusOK, 3, ""},
		{"pow", PowHandler, "/pow?operand1=2&operand2=3", http.StatusOK, 8, ""},
		{"percent", PercentHandler, "/percent?operand1=20&operand2=50", http.StatusOK, 10, ""},

		// Error cases
		{"divide by zero", DivideHandler, "/divide?operand1=1&operand2=0", http.StatusBadRequest, 0, "division by zero"},
		{"sqrt negative", SqrtHandler, "/sqrt?operand1=-1", http.StatusBadRequest, 0, "square root of negative number"},
		{"missing operand2", AddHandler, "/add?operand1=1", http.StatusBadRequest, 0, "invalid parameter 'operand2'"},
		{"invalid operand1", AddHandler, "/add?operand1=abc&operand2=2", http.StatusBadRequest, 0, "invalid parameter 'operand1'"},
		{"invalid operator (pow with bad input)", PowHandler, "/pow?operand1=abc&operand2=2", http.StatusBadRequest, 0, "invalid parameter 'operand1'"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", tt.url, nil)
			rec := httptest.NewRecorder()
			tt.handler(rec, req)

			res := rec.Result()
			if res.StatusCode != tt.wantStatus {
				t.Errorf("status %d, want %d", res.StatusCode, tt.wantStatus)
			}

			var body Result
			json.NewDecoder(res.Body).Decode(&body)

			if tt.wantError != "" {
				if body.Error != tt.wantError {
					t.Errorf("error %q, want %q", body.Error, tt.wantError)
				}
			} else {
				if body.Result != tt.wantResult {
					t.Errorf("result %f, want %f", body.Result, tt.wantResult)
				}
			}
		})
	}
}

func TestSqrtHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/sqrt?operand1=9", nil)
	rec := httptest.NewRecorder()
	SqrtHandler(rec, req)

	res := rec.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var body Result
	json.NewDecoder(res.Body).Decode(&body)
	if body.Result != 3 {
		t.Errorf("expected 3, got %f", body.Result)
	}
}

func TestHealthHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)

	res := rec.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var body map[string]string
	json.NewDecoder(res.Body).Decode(&body)
	if body["status"] != "ok" {
		t.Errorf("expected status 'ok', got %q", body["status"])
	}
}

func TestSqrtHandlerInvalid(t *testing.T) {
	// invalid operand
	req := httptest.NewRequest("GET", "/sqrt?operand1=abc", nil)
	rec := httptest.NewRecorder()
	SqrtHandler(rec, req)
	res := rec.Result()
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", res.StatusCode)
	}
	var body Result
	json.NewDecoder(res.Body).Decode(&body)
	if body.Error != "invalid parameter 'operand1'" {
		t.Errorf("unexpected error: %q", body.Error)
	}

	// method not allowed
	req = httptest.NewRequest("POST", "/sqrt?operand1=9", nil)
	rec = httptest.NewRecorder()
	SqrtHandler(rec, req)
	res = rec.Result()
	if res.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", res.StatusCode)
	}
	json.NewDecoder(res.Body).Decode(&body)
	if body.Error != "method not allowed" {
		t.Errorf("unexpected error: %q", body.Error)
	}
}

func TestCORSMiddleware(t *testing.T) {
	// Create a dummy handler that the middleware calls
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})

	middleware := CORSMiddleware(next)

	// OPTIONS request: should return 204 without calling next
	req := httptest.NewRequest("OPTIONS", "/", nil)
	rec := httptest.NewRecorder()
	middleware.ServeHTTP(rec, req)
	res := rec.Result()
	if res.StatusCode != http.StatusNoContent {
		t.Errorf("expected 204, got %d", res.StatusCode)
	}
	if nextCalled {
		t.Error("next handler should NOT have been called for OPTIONS")
	}
	// Check CORS header
	if res.Header.Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing Access-Control-Allow-Origin header")
	}

	// GET request: should call next and still have CORS header
	nextCalled = false
	req = httptest.NewRequest("GET", "/", nil)
	rec = httptest.NewRecorder()
	middleware.ServeHTTP(rec, req)
	res = rec.Result()
	if res.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", res.StatusCode)
	}
	if !nextCalled {
		t.Error("next handler should have been called for GET")
	}
	if res.Header.Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing Access-Control-Allow-Origin header")
	}
}

func TestLoggingMiddleware(t *testing.T) {
	// We just verify it calls the next handler and doesn't panic.
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})

	middleware := LoggingMiddleware(next)

	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()
	middleware.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}
	if !nextCalled {
		t.Error("next handler was not called")
	}
}

func TestMethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest("POST", "/add?operand1=1&operand2=2", nil)
	rec := httptest.NewRecorder()
	AddHandler(rec, req)

	res := rec.Result()
	if res.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", res.StatusCode)
	}
	var body Result
	json.NewDecoder(res.Body).Decode(&body)
	if body.Error != "method not allowed" {
		t.Errorf("expected error, got %q", body.Error)
	}
}
