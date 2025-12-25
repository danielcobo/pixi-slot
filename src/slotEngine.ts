import {
    GRID_COLUMNS,
    GRID_ROWS,
    SYMBOL_CONFIGS,
    type SymbolConfig,
    type SymbolId,
} from './config';
import { random, randomInt } from './utils/rng';

export type Grid = SymbolConfig[][];

export interface Payline {
    id: string;
    /** Row index for each column. rowsByCol[col] = row */
    rowsByCol: number[];
}

export interface LineWin {
    paylineId: string;
    winSymbolId: SymbolId;
    winMultiplier: number;
    explanation: string;
}

export interface SpinResult {
    grid: Grid;
    lineWins: LineWin[];
    totalWinMultiplier: number;
}

interface WeightedPicker {
    pick(rng?: number): SymbolConfig;
}

const createPickFunction = (
    symbols: readonly SymbolConfig[],
    cumulative: number[],
    total: number
) => {
    return (rng = random()): SymbolConfig => {
        const x = rng * total;
        // Binary search for efficiency
        let low = 0;
        let high = cumulative.length - 1;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (x < cumulative[mid]) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return symbols[low];
    };
};

/**
 * Build a weighted random picker for symbols.
 * Select symbols with higher weight values more frequently.
 *
 * @param symbols - Array of symbol configurations with weights
 * @returns WeightedPicker that can randomly select symbols based on their weights
 */
const buildWeightedPicker = (symbols: readonly SymbolConfig[]): WeightedPicker => {
    let total = 0;
    const cumulative: number[] = [];

    for (const s of symbols) {
        total += s.weight;
        cumulative.push(total);
    }

    return {
        pick: createPickFunction(symbols, cumulative, total),
    };
};

const createHorizontalPaylines = (rows: number, cols: number): Payline[] => {
    const paylines: Payline[] = [];
    for (let r = 0; r < rows; r++) {
        paylines.push({
            id: `ROW_${r}`,
            rowsByCol: Array(cols).fill(r),
        });
    }
    return paylines;
};

/**
 * Evaluate a single payline to determine if it's a winning line.
 * Support WILD symbol substitution. All symbols must match (or be WILD) to win.
 *
 * @param symbols - Symbols along the payline
 * @param wildId - ID of the WILD symbol
 * @returns Win details if the line wins, null otherwise
 */
const evaluatePayline = (
    symbols: SymbolConfig[],
    wildId: SymbolId
): { multiplier: number; symbol: SymbolId; explanation: string } | null => {
    const nonWild = symbols.filter((s) => s.id !== wildId);

    if (nonWild.length === 0) {
        return {
            multiplier: symbols[0].multiplier,
            symbol: wildId,
            explanation: 'All WILD symbols',
        };
    }

    const base = nonWild[0].id;
    if (!nonWild.every((s) => s.id === base)) return null;

    return {
        multiplier: nonWild[0].multiplier,
        symbol: base,
        explanation:
            nonWild.length === symbols.length ? `All ${base}` : `${base} with WILD substitution`,
    };
};

export interface SlotMachineConfig {
    symbols?: readonly SymbolConfig[];
    rows?: number;
    columns?: number;
}

export class SlotMachine {
    private picker;
    private wildId: SymbolId;
    private paylines: readonly Payline[];
    private readonly rows: number;
    private readonly columns: number;

    constructor(config: SlotMachineConfig = {}) {
        const symbols = config.symbols ?? SYMBOL_CONFIGS;
        this.rows = config.rows ?? GRID_ROWS;
        this.columns = config.columns ?? GRID_COLUMNS;

        this.picker = buildWeightedPicker(symbols);

        const wildSymbol = symbols.find((s) => s.isWild);
        if (!wildSymbol) {
            throw new Error('Configuration must include a WILD symbol');
        }
        this.wildId = wildSymbol.id;

        this.paylines = createHorizontalPaylines(this.rows, this.columns);
    }

    spin(overrideGrid?: Grid): SpinResult {
        const grid: Grid =
            overrideGrid ?? Array.from({ length: this.rows }, () => Array(this.columns));

        if (!overrideGrid) {
            for (let c = 0; c < this.columns; c++) {
                for (let r = 0; r < this.rows; r++) {
                    grid[r][c] = this.picker.pick();
                }
            }
        }

        const lineWins: LineWin[] = [];
        let total = 0;

        for (const line of this.paylines) {
            const symbols = line.rowsByCol.map((r, c) => grid[r][c]);
            const win = evaluatePayline(symbols, this.wildId);
            if (!win) continue;

            lineWins.push({
                paylineId: line.id,
                winSymbolId: win.symbol,
                winMultiplier: win.multiplier,
                explanation: win.explanation,
            });

            total += win.multiplier;
        }

        return { grid, lineWins, totalWinMultiplier: total };
    }
}

/**
 * Generate a grid that guarantees at least one winning line.
 * Use for testing and demo purposes (triggered by 'w' key).
 *
 * @returns A grid with one random row containing all matching symbols
 */
export const generateWinningGrid = (): Grid => {
    const picker = buildWeightedPicker(SYMBOL_CONFIGS);
    const grid: Grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        grid.push(Array(GRID_COLUMNS));
    }

    const winningRow = randomInt(0, GRID_ROWS - 1);
    const winningSymbol = picker.pick();

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLUMNS; c++) {
            grid[r][c] = r === winningRow ? winningSymbol : picker.pick();
        }
    }

    return grid;
};
