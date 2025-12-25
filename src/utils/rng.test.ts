import { describe, it, expect } from 'vitest';
import { random, randomInt } from './rng';

describe('random', () => {
    it('should return a number between 0 and 1', () => {
        for (let i = 0; i < 100; i++) {
            const value = random();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it('should return different values', () => {
        const values = new Set();
        for (let i = 0; i < 10; i++) {
            values.add(random());
        }
        expect(values.size).toBeGreaterThan(1);
    });
});

describe('randomInt', () => {
    it('should respect min and max bounds (both inclusive)', () => {
        const min = 5;
        const max = 8;

        for (let i = 0; i < 100; i++) {
            const value = randomInt(min, max);
            expect(value).toBeGreaterThanOrEqual(min);
            expect(value).toBeLessThanOrEqual(max);
            expect(Number.isInteger(value)).toBe(true);
        }
    });

    it('should return only value when min === max', () => {
        const value = randomInt(5, 5);
        expect(value).toBe(5);
    });

    it('should include both bounds in results', () => {
        // Test that over many runs, we see both min and max
        const results = new Set<number>();
        for (let i = 0; i < 100; i++) {
            results.add(randomInt(1, 3));
        }
        // Should get 1, 2, and 3 over 100 iterations
        expect(results.has(1)).toBe(true);
        expect(results.has(3)).toBe(true);
    });
});
