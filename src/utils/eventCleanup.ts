export class EventCleanupManager {
    private cleanupFunctions: Array<() => void> = [];

    /**
     * Registers a window event listener with automatic cleanup.
     */
    addWindowListener<K extends keyof WindowEventMap>(
        event: K,
        handler: (event: WindowEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        window.addEventListener(event, handler, options);
        this.cleanupFunctions.push(() => {
            window.removeEventListener(event, handler, options);
        });
    }

    /**
     * Registers a cleanup function to be called during cleanup.
     */
    addCleanup(cleanup: () => void): void {
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Removes all registered event listeners and runs cleanup functions.
     */
    cleanup(): void {
        this.cleanupFunctions.forEach((cleanup) => cleanup());
        this.cleanupFunctions = [];
    }

    /**
     * Returns the number of registered cleanup functions.
     */
    get count(): number {
        return this.cleanupFunctions.length;
    }
}
