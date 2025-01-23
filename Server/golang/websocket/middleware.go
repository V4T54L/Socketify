package websocket

import (
	"log"
)

type MiddlewareFunc func(Connection, Message) Message

func LoggingMiddleware(conn Connection, message Message) Message {
	log.Printf("Received message from %s: %v", conn.ID, message)
	// Return the message unchanged
	return message
}

func AuthMiddleware(conn Connection, message Message) Message {
	// Implement authentication check
	return message
}
