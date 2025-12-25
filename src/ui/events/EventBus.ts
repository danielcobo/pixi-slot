type EventCallback<T = unknown> = (data: T) => void;

export class EventBus {
    private listeners = new Map<string, Set<(data: unknown) => void>>();
    on<T>(event: string, callback: EventCallback<T>): () => void {
        let callbacks = this.listeners.get(event);
        if (!callbacks) {
            callbacks = new Set();
            this.listeners.set(event, callbacks);
        }

        // Create a wrapper that narrows unknown back to T
        // This is safe because emit() is called with the correct type
        const wrappedCallback = (data: unknown): void => {
            // We trust that emit() provides the correct type
            // The type system can't prove this, but it's enforced by our API design
            callback(data as T);
        };

        callbacks.add(wrappedCallback);

        // Return unsubscribe function
        return () => {
            const currentCallbacks = this.listeners.get(event);
            if (currentCallbacks) {
                currentCallbacks.delete(wrappedCallback);
                if (currentCallbacks.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }
    once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
        const unsubscribe = this.on<T>(event, (data) => {
            unsubscribe();
            callback(data);
        });
        return unsubscribe;
    }
    emit<T = unknown>(event: string, data: T): void {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;

        callbacks.forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        });
    }
    off(event?: string): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
    listenerCount(event: string): number {
        return this.listeners.get(event)?.size ?? 0;
    }
}
