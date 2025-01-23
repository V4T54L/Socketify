import { WebSocketClient } from "../../socketify-lib/src/WebsocketClient";

function sendPingEvery5Seconds(): number {
    const intervalId = setInterval(() => {
        if (client && clientConnected) {
            try {
                console.log('Sending ping message...');
                client.send('ping', {});
            } catch (error) {
                console.error('Error sending ping message:', error);
                clearInterval(intervalId); // Clear interval to prevent multiple reconnects on error
            }
        } else {
            clearInterval(intervalId);
        }
    }, 5000); // Every 5 seconds (5000 milliseconds)

    return intervalId; // Return the intervalId to allow for manual clear or stop
}

const SERVER_URL = 'ws://localhost:8080';
let clientConnected: Boolean = false

// Define middleware functions
const loggingMiddleware = (data: any, next: () => void) => {
    console.log('Middleware: Sending data:', data);
    next();
};

const errorMiddleware = (error: Error, next: () => void) => {
    console.error('Middleware: Error occurred:', error);
    next();
};

interface BroadcastMessage {
    text: string;
}

// Initialize WebSocket client
const client = new WebSocketClient(SERVER_URL, {
    maxReconnectAttempts: 5,
    reconnectDelay: 1000
});

// use it to clear interval
let pingIntervalId = sendPingEvery5Seconds();

// Add middleware
client.use(loggingMiddleware);
client.use(errorMiddleware);

client.on('disconnected', () => {
    clientConnected = false
    console.log('Disconnected from WebSocket server');
});

function handleIncomingMessage(data: BroadcastMessage) {
    console.log("Message from the server : ", data.text);

    // Display message in chat area
    const chatArea = document.getElementById('chatArea') as HTMLDivElement;
    const messageElement = document.createElement('p');
    messageElement.textContent = data.text;
    chatArea.appendChild(messageElement);
}

client.on('connected', () => {
    clientConnected = true
    // Send a greeting after connecting
    sendMessage('Hello, everyone!');
});

client.on("broadcastResponse", handleIncomingMessage);
client.on("pong", () => console.log("Pong received"));

function sendMessage(message: string) {
    console.log('Connected to WebSocket server');
    try {
        client.send('broadcast', { text: message });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Handle user input
document.querySelector('#sendButton')?.addEventListener('click', () => {
    const messageInput = document.querySelector<HTMLInputElement>('#messageInput');
    const message = messageInput?.value;

    if (message) {
        sendMessage(message);
        messageInput.value = ''; // Clear input field
    }
});