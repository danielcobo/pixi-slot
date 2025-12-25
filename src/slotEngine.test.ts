import { describe, it, expect } from 'vitest';
import { SlotMachine, generateWinningGrid } from './slotEngine';
import { GRID_ROWS, GRID_COLUMNS, SYMBOL_CONFIGS } from './config';

describe('SlotMachine', () => {
    it('should generate a valid grid', () => {
        const machine = new SlotMachine();
        const result = machine.spin();

        expect(result.grid).toHaveLength(GRID_ROWS);
        expect(result.grid[0]).toHaveLength(GRID_COLUMNS);
        expect(result.lineWins).toBeDefined();
        expect(result.totalWinMultiplier).toBeGreaterThanOrEqual(0);
    });

    it('should respect forced grid', () => {
        const machine = new SlotMachine();
        const forcedGrid = Array.from({ length: GRID_ROWS }, () =>
            Array(GRID_COLUMNS).fill(SYMBOL_CONFIGS[0])
        );

        const result = machine.spin(forcedGrid);

        expect(result.grid).toEqual(forcedGrid);
    });

    it('should detect winning lines', () => {
        const machine = new SlotMachine();
        // Create a grid with all cherries in first row
        const winningGrid = Array.from({ length: GRID_ROWS }, (_, row) =>
            Array(GRID_COLUMNS).fill(row === 0 ? SYMBOL_CONFIGS[0] : SYMBOL_CONFIGS[1])
        );

        const result = machine.spin(winningGrid);

        expect(result.lineWins.length).toBeGreaterThan(0);
        expect(result.totalWinMultiplier).toBeGreaterThan(0);
    });

    it('should handle wild symbols', () => {
        const machine = new SlotMachine();
        const wildSymbol = SYMBOL_CONFIGS.find((s) => s.isWild);
        const cherrySymbol = SYMBOL_CONFIGS[0];

        if (!wildSymbol) return;

        // Mix wild and cherry in first row
        const grid = Array.from({ length: GRID_ROWS }, (_, row) => {
            if (row === 0) {
                return [cherrySymbol, wildSymbol, cherrySymbol, wildSymbol, cherrySymbol];
            }
            return Array(GRID_COLUMNS).fill(SYMBOL_CONFIGS[1]);
        });

        const result = machine.spin(grid);

        expect(result.lineWins.length).toBeGreaterThan(0);
        expect(result.lineWins[0].explanation).toContain('WILD');
    });
});

describe('generateWinningGrid', () => {
    it('should generate a grid with at least one winning line', () => {
        const machine = new SlotMachine();
        const grid = generateWinningGrid();
        const result = machine.spin(grid);

        expect(result.lineWins.length).toBeGreaterThan(0);
        expect(result.totalWinMultiplier).toBeGreaterThan(0);
    });

    it('should have valid dimensions', () => {
        const grid = generateWinningGrid();

        expect(grid).toHaveLength(GRID_ROWS);
        expect(grid[0]).toHaveLength(GRID_COLUMNS);
    });
});
