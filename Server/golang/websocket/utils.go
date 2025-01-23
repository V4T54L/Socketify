package websocket

import (
	"github.com/google/uuid"
)

func generateConnectionID(length int) string {
	return uuid.New().String()
}
