// pkg/calculator/calculator.go
package calculator

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrInvalidOp      = errors.New("invalid operation")
	ErrSqrtNegative   = errors.New("square root of negative number")
	ErrOverflow       = errors.New("overflow")
)

func Calculate(operator string, operand1, operand2 float64) (float64, error) {
	var result float64

	switch operator {
	case "add":
		result = operand1 + operand2
	case "subtract":
		result = operand1 - operand2
	case "multiply":
		result = operand1 * operand2
	case "divide":
		if operand2 == 0 {
			return 0, ErrDivisionByZero
		}
		result = operand1 / operand2
	case "pow":
		result = math.Pow(operand1, operand2)
	case "sqrt":
		if operand1 < 0 {
			return 0, ErrSqrtNegative
		}
		result = math.Sqrt(operand1)
	case "percent":
		result = (operand1 / 100) * operand2
	default:
		return 0, ErrInvalidOp
	}

	// Overflow / NaN check
	if math.IsInf(result, 0) || math.IsNaN(result) {
		return 0, ErrOverflow
	}

	// Round to 15 decimal places to avoid floating‑point noise
	return round(result, 15), nil
}

func round(value float64, decimals int) float64 {
	pow := math.Pow(10, float64(decimals))
	return math.Round(value*pow) / pow
}
