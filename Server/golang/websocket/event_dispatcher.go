package websocket

import "log"

type Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type EventDispatcher interface {
	Dispatch(connId string, message Message)
}

type ExampleEventDispatcher struct {
	ConnectionManager *ConnectionManager
}

func (ed *ExampleEventDispatcher) Dispatch(connId string, message Message) {
	switch message.Event {
	case "broadcast":
		// Broadcast to all clients
		message.Event = "broadcastResponse"
		ed.ConnectionManager.Broadcast(message)
	case "ping":
		// Send message to the sender
		message.Event = "pong"
		ed.ConnectionManager.ToConnection(connId, message)

	default:
		log.Printf("Event not handled: %s", message.Event)
	}
}
