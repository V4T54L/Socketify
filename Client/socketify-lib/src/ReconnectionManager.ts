export class ReconnectionManager {
    private attempts: number = 0;
    private maxAttempts: number;
    private delay: number;
    private onReconnect: () => void;

    constructor(maxAttempts: number = 5, delay: number = 1000, onReconnect: () => void) {
        this.maxAttempts = maxAttempts;
        this.delay = delay;
        this.onReconnect = onReconnect;
    }

    resetAttempts() {
        this.attempts = 0
    }

    async attemptReconnection() {
        while (this.attempts < this.maxAttempts) {
            await this.delayConnection();
            this.attempts += 1;
            this.onReconnect();
        }
    }

    private delayConnection() {
        return new Promise(res => setTimeout(res, this.delay * this.attempts));
    }
}