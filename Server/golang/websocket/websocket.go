package websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

type Connection struct {
	ID      string
	Socket  *websocket.Conn
	Manager *ConnectionManager
}

type ConnectionManager struct {
	connections     map[*Connection]bool
	EventDispatcher EventDispatcher
}

func NewConnectionManager(eventDispatcher EventDispatcher) *ConnectionManager {
	connManager := &ConnectionManager{
		connections:     make(map[*Connection]bool),
		EventDispatcher: eventDispatcher,
	}

	return connManager
}

func (cm *ConnectionManager) AddConnection(conn *websocket.Conn) *Connection {
	connection := &Connection{
		ID:      generateConnectionID(10),
		Socket:  conn,
		Manager: cm,
	}

	cm.connections[connection] = true

	go cm.handleMessages(connection)

	return connection
}

// Broadcast message to all connected clients
func (cm *ConnectionManager) Broadcast(message Message) {
	for conn := range cm.connections {
		err := conn.Socket.WriteJSON(message)
		if err != nil {
			log.Printf("Error broadcasting message to %s: %v", conn.ID, err)
			continue
		}
	}
}

// Emit message to a specific connection
func (cm *ConnectionManager) Emit(conn *Connection, message Message) {
	err := conn.Socket.WriteJSON(message)
	if err != nil {
		log.Printf("Error sending message to %s: %v", conn.ID, err)
	}
}

// Emit message to a specific connection
func (cm *ConnectionManager) ToConnection(id string, message Message) {
	var conn Connection
	for c := range cm.connections {
		if c.ID == id {
			conn = *c
			break
		}
	}
	cm.Emit(&conn, message)
}

func (cm *ConnectionManager) handleMessages(conn *Connection) {

	defer func() {
		cm.RemoveConnection(conn)
	}()

	for {
		var message Message
		err := conn.Socket.ReadJSON(&message)
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		// Handle the message and dispatch events
		cm.EventDispatcher.Dispatch(conn.ID, message)
	}
}

func (cm *ConnectionManager) RemoveConnection(conn *Connection) {
	delete(cm.connections, conn)
	conn.Socket.Close()
}
