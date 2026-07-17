package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"calculator-backend/pkg/calculator"
)

// Result is exported for reuse
type Result struct {
	Result float64 `json:"result"`
	Error  string  `json:"error,omitempty"`
}

// BinaryOpHandler handles any binary operation
func BinaryOpHandler(w http.ResponseWriter, r *http.Request, op string) {
	if r.Method != http.MethodGet {
		sendJSONResponse(w, http.StatusMethodNotAllowed, Result{Error: "method not allowed"})
		return
	}

	operand1Str := r.URL.Query().Get("operand1")
	operand2Str := r.URL.Query().Get("operand2")

	operand1, err := strconv.ParseFloat(operand1Str, 64)
	if err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Result{Error: "invalid parameter 'operand1'"})
		return
	}
	operand2, err := strconv.ParseFloat(operand2Str, 64)
	if err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Result{Error: "invalid parameter 'operand2'"})
		return
	}

	result, calcErr := calculator.Calculate(op, operand1, operand2)
	if calcErr != nil {
		sendJSONResponse(w, http.StatusBadRequest, Result{Error: calcErr.Error()})
		return
	}

	sendJSONResponse(w, http.StatusOK, Result{Result: result})
}

// Individual handler functions (curried)
func AddHandler(w http.ResponseWriter, r *http.Request)      { BinaryOpHandler(w, r, "add") }
func SubtractHandler(w http.ResponseWriter, r *http.Request) { BinaryOpHandler(w, r, "subtract") }
func MultiplyHandler(w http.ResponseWriter, r *http.Request) { BinaryOpHandler(w, r, "multiply") }
func DivideHandler(w http.ResponseWriter, r *http.Request)   { BinaryOpHandler(w, r, "divide") }
func PowHandler(w http.ResponseWriter, r *http.Request)      { BinaryOpHandler(w, r, "pow") }
func PercentHandler(w http.ResponseWriter, r *http.Request)  { BinaryOpHandler(w, r, "percent") }

func sendJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
