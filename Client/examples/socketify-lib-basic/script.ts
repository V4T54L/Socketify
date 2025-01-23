import { WebSocketClient } from "../../socketify-lib/src/WebsocketClient";

// Constants
const SERVER_URL = 'ws://localhost:8080';
const PING_INTERVAL_MS = 5000;
const MESSAGE_TYPE_BROADCAST = 'broadcast';
const MESSAGE_TYPE_PING = 'ping';

// State
let clientConnected: boolean = false;

// Define middleware functions
const loggingMiddleware = (data: Record<string, any>, next: () => void) => {
    console.log('Middleware: Sending data:', data);
    next();
};

const errorMiddleware = (error: Error, next: () => void) => {
    console.error('Middleware: Error occurred:', error);
    next();
};

// Initialize WebSocket client
const client = new WebSocketClient(SERVER_URL, {
    maxReconnectAttempts: 5,
    reconnectDelay: 1000
});

// Start sending ping messages
const sendPingEvery5Seconds = () => {
    const intervalId = setInterval(() => {
        if (clientConnected) {
            try {
                console.log('Sending ping message...');
                client.send(MESSAGE_TYPE_PING, {});
            } catch (error) {
                console.error('Error sending ping message:', error);
                clearInterval(intervalId);
            }
        } else {
            clearInterval(intervalId);
        }
    }, PING_INTERVAL_MS);
};

// Add middleware
client.use(loggingMiddleware);
client.use(errorMiddleware);

// Handle WebSocket events
client.on('disconnected', () => {
    clientConnected = false;
    console.log('Disconnected from WebSocket server');
});

client.on('connected', () => {
    clientConnected = true;
    sendPingEvery5Seconds();
    sendMessage('Hello, everyone!');
});

client.on("broadcastResponse", (data: { text: string }) => {
    console.log("Message from the server : ", data.text);
    const chatArea = document.getElementById('chatArea') as HTMLDivElement;
    if (chatArea) {
        const messageElement = document.createElement('p');
        messageElement.textContent = data.text;
        chatArea.appendChild(messageElement);
    }
});

client.on("pong", () => console.log("Pong received"));

function sendMessage(message: string) {
    if (!clientConnected) {
        console.error('Cannot send message, not connected.');
        return;
    }
    try {
        client.send(MESSAGE_TYPE_BROADCAST, { text: message });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Handle user input
document.querySelector('#sendButton')?.addEventListener('click', () => {
    const messageInput = document.querySelector<HTMLInputElement>('#messageInput');
    if (!messageInput) {
        return
    }
    const message = messageInput?.value.trim(); // Trim whitespace

    if (message) {
        sendMessage(message);
        messageInput.value = ''; // Clear input field
    } else {
        console.warn('Empty message cannot be sent.');
    }
});