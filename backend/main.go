package main

import (
	"log"
	"net/http"

	"calculator-backend/handlers"
)

func main() {
	v1 := http.NewServeMux()

	// Health check
	v1.HandleFunc("/health", handlers.HealthHandler)

	// Binary operations
	v1.HandleFunc("/add", handlers.AddHandler)
	v1.HandleFunc("/subtract", handlers.SubtractHandler)
	v1.HandleFunc("/multiply", handlers.MultiplyHandler)
	v1.HandleFunc("/divide", handlers.DivideHandler)
	v1.HandleFunc("/pow", handlers.PowHandler)
	v1.HandleFunc("/percent", handlers.PercentHandler)

	// Unary operation
	v1.HandleFunc("/sqrt", handlers.SqrtHandler)

	// Mount the v1 router under /api/v1/
	wrapper := handlers.LoggingMiddleware(handlers.CORSMiddleware(v1))

	http.Handle("/api/v1/", http.StripPrefix("/api/v1", wrapper))

	log.Println("Backend listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
