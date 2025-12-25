/**
 * Simple logger interface for the application.
 * Can be easily swapped with more sophisticated logging in production.
 */
export interface Logger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

class ConsoleLogger implements Logger {
    info(message: string, ...args: unknown[]): void {
        console.log(`[INFO] ${message}`, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.warn(`[WARN] ${message}`, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }
}

// Global logger instance
export const logger: Logger = new ConsoleLogger();
