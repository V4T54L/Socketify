package websocket

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Router struct {
	connectionManager *ConnectionManager
}

func NewRouter(connectionManager *ConnectionManager) *mux.Router {
	rm := &Router{
		connectionManager: connectionManager,
	}

	r := mux.NewRouter()

	// Define routes for WebSocket
	r.HandleFunc("/ws", rm.handleWebSocket)

	// Define HTTP routes
	r.HandleFunc("/", rm.handleHome).Methods("GET")

	http.Handle("/", r)

	return r
}

func (rm *Router) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusBadRequest)
		return
	}

	rm.connectionManager.AddConnection(conn)
}

func (rm *Router) handleHome(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Welcome to the WebSocket server!"))
}
