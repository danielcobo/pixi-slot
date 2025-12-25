import { logger } from './logger';

let hasLoggedFallback = false;

/**
 * Generate a cryptographically secure random number between 0 and 1.
 * Falls back to Math.random() if crypto API is unavailable.
 *
 * Note: For a production, RNG should be server-side.
 * This is only for demo.
 *
 * @returns Random number in range [0, 1)
 */
export const random = (): number => {
    if (crypto?.getRandomValues) {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return buffer[0] / 2 ** 32;
    }

    // Log fallback warning once
    if (!hasLoggedFallback) {
        logger.warn('Crypto API unavailable, falling back to Math.random()');
        hasLoggedFallback = true;
    }

    return Math.random();
};

/**
 * Generate a random integer between min and max (both inclusive).
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export const randomInt = (min: number, max: number): number => {
    return Math.floor(random() * (max - min + 1)) + min;
};
