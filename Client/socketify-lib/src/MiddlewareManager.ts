export type MiddlewareFunction = (data: any, next: () => void) => void;

export class MiddlewareManager {
    private middlewares: MiddlewareFunction[] = [];

    use(middleware: MiddlewareFunction) {
        this.middlewares.push(middleware);
    }

    run(data: any) {
        const executeMiddleware = (index: number) => {
            if (index < this.middlewares.length) {
                this.middlewares[index](data, () => executeMiddleware(index + 1));
            }
        };
        executeMiddleware(0);
    }
}