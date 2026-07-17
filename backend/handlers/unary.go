package handlers

import (
	"net/http"
	"strconv"

	"calculator-backend/pkg/calculator"
)

func SqrtHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSONResponse(w, http.StatusMethodNotAllowed, Result{Error: "method not allowed"})
		return
	}

	operand1Str := r.URL.Query().Get("operand1")
	operand1, err := strconv.ParseFloat(operand1Str, 64)
	if err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Result{Error: "invalid parameter 'operand1'"})
		return
	}

	result, calcErr := calculator.Calculate("sqrt", operand1, 0) // second operand ignored
	if calcErr != nil {
		sendJSONResponse(w, http.StatusBadRequest, Result{Error: calcErr.Error()})
		return
	}

	sendJSONResponse(w, http.StatusOK, Result{Result: result})
}
