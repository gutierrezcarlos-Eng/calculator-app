// pkg/calculator/calculator_test.go
package calculator

import (
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name               string
		operator           string
		operand1, operand2 float64
		expected           float64
		expectError        error
	}{
		{"add", "add", 1, 2, 3, nil},
		{"subtract", "subtract", 5, 3, 2, nil},
		{"multiply", "multiply", 2, 3, 6, nil},
		{"divide", "divide", 6, 2, 3, nil},
		{"divide by zero", "divide", 1, 0, 0, ErrDivisionByZero},
		{"pow", "pow", 2, 3, 8, nil},
		{"sqrt", "sqrt", 9, 0, 3, nil}, // b ignored
		{"sqrt negative", "sqrt", -1, 0, 0, ErrSqrtNegative},
		{"percent", "percent", 20, 50, 10, nil},
		{"invalid op", "bad", 0, 0, 0, ErrInvalidOp},
		{"overflow multiply", "multiply", math.MaxFloat64, 2, 0, ErrOverflow},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.operator, tt.operand1, tt.operand2)
			if err != tt.expectError {
				t.Errorf("expected error %v, got %v", tt.expectError, err)
			}
			if err == nil && got != tt.expected {
				t.Errorf("Expected error %f, got %f", tt.expectError, got)
			}
		})
	}
}
