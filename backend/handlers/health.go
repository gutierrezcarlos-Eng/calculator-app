package handlers

import "net/http"

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	sendJSONResponse(w, http.StatusOK, map[string]string{"status": "ok"})
}
