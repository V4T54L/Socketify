package main

import (
	"log"
	"net/http"
	"socketify-backend/websocket"
)

func main() {
	eventDispatcher := websocket.ExampleEventDispatcher{}
	connectionManager := websocket.NewConnectionManager(&eventDispatcher)
	eventDispatcher.ConnectionManager = connectionManager

	// Initialize the router
	router := websocket.NewRouter(connectionManager)

	// Start the HTTP and WebSocket server
	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
