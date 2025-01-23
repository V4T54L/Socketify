import { EventEmitter } from "./EventEmitter";
import { MiddlewareFunction, MiddlewareManager } from "./MiddlewareManager";
import { ReconnectionManager } from "./ReconnectionManager";

export interface Message {
    event: string;
    data?: any;
}

export class WebSocketClient extends EventEmitter {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectionManager: ReconnectionManager;
    private middlewareManager: MiddlewareManager;

    constructor(url: string, options: { maxReconnectAttempts?: number; reconnectDelay?: number }) {
        super();
        this.url = url;
        this.reconnectionManager = new ReconnectionManager(
            options.maxReconnectAttempts,
            options.reconnectDelay,
            () => this.connect()
        );
        this.middlewareManager = new MiddlewareManager();
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
            // call on:connected handler on client
            this.emit("connected");
            this.reconnectionManager.resetAttempts();
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const message: Message = JSON.parse(event.data);
            this.emit(message.event, message.data);
            this.middlewareManager.run(message.data);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed, attempting to reconnect");
            // call on:disconnected handler on client
            this.emit("disconnected");
            this.reconnectionManager.attemptReconnection();
        };

        this.socket.onerror = (error: Event) => {
            console.error("WebSocket Error:", error);
        };
    }


    public use(middleware: MiddlewareFunction) {
        this.middlewareManager.use(middleware);
    }

    send(event: string, data?: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            const message: Message = { event, data };
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Ready state: ", this.socket?.readyState);
        }
    }
}