import { Container, Graphics, Ticker, Texture } from 'pixi.js';
import {
    GRID_ROWS,
    INNER_HEIGHT,
    REEL_BACKGROUND_COLOR,
    SPIN_DURATION_MS,
    REEL_HIGHLIGHT_COLOR,
    REEL_NORMAL_TINT,
    BLINK_DURATION_MS,
    BLINK_INTERVAL_MS,
    MIN_SPIN_ROTATIONS,
    EASE_OUT_CUBIC_POWER,
    type SymbolConfig,
} from '../../config';
import { randomInt } from '../../utils/rng';
import { Symbol } from './symbol';
import type { UIEventBus } from '../events';

const EMPTY_ROW_SET = new Set<number>();

interface AnimationState {
    targetDistance: number;
    distanceTraveled: number;
}

export class Reel extends Container {
    readonly reelIndex: number;
    readonly reelWidth: number;
    readonly symbolHeight: number;
    readonly symbols: Symbol[] = [];
    private isSpinning: boolean = false;
    private spinStartTime: number = 0;
    private symbolTextures: Map<string, Texture> = new Map();
    private cellBackgrounds: Graphics[] = [];
    private blinkTicker?: Ticker;
    private blinkCallback?: () => void;
    private animationState?: AnimationState;
    private currentTicker: Ticker;
    private eventBus: UIEventBus;
    private unsubscribers: (() => void)[] = [];

    constructor(
        reelIndex: number,
        reelWidth: number,
        symbolHeight: number,
        separatorWidth: number,
        eventBus: UIEventBus,
        ticker: Ticker
    ) {
        super();
        this.reelIndex = reelIndex;
        this.reelWidth = reelWidth;
        this.symbolHeight = symbolHeight;
        this.eventBus = eventBus;
        this.currentTicker = ticker;

        this.label = `reel${reelIndex}`;
        const reelLeftX = reelIndex * (reelWidth + separatorWidth);
        this.position.set(reelLeftX, 0);

        for (let row = 0; row < GRID_ROWS; row++) {
            const cellBackground = new Graphics();
            cellBackground.label = `reel${this.reelIndex}Cell${row}`;
            cellBackground.rect(0, row * this.symbolHeight, this.reelWidth, this.symbolHeight);
            cellBackground.fill(REEL_BACKGROUND_COLOR);
            this.addChild(cellBackground);
            this.cellBackgrounds.push(cellBackground);
        }

        const mask = new Graphics();
        mask.label = `reelMask${reelIndex}`;
        mask.rect(0, 0, reelWidth, INNER_HEIGHT);
        mask.fill(0xffffff);
        this.addChild(mask);
        this.mask = mask;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const unsubSpinStarted = this.eventBus.onReelSpinStarted((event) => {
            if (event.reelIndex === this.reelIndex) {
                this.spin(event.targetSymbols);
            }
        });
        this.unsubscribers.push(unsubSpinStarted);

        const unsubWinOccurred = this.eventBus.onWinOccurred((event) => {
            this.setHighlightedRows(event.winningRows);
            this.startBlink(event.winningRows, this.currentTicker);
        });
        this.unsubscribers.push(unsubWinOccurred);

        const unsubSpinStartedClear = this.eventBus.onSpinStarted(() => {
            this.stopBlink();
            this.setHighlightedRows(new Set());
        });
        this.unsubscribers.push(unsubSpinStartedClear);
    }

    addSymbol(symbol: Symbol, symbolIndex: number): void {
        symbol.label = `reel${this.reelIndex}Symbol${symbolIndex}`;
        this.symbols.push(symbol);
        this.addChild(symbol);
    }

    setSymbolTextures(textures: Map<string, Texture>): void {
        this.symbolTextures = textures;
    }

    private findCurrentTopSymbolIndex(): number {
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const row = Math.round((symbol.y - this.symbolHeight / 2) / this.symbolHeight);
            if (row === 0) {
                return i;
            }
        }
        return 0;
    }

    private injectTargetSymbols(targetSymbols: SymbolConfig[]): number {
        const stripLength = this.symbols.length;
        const injectPosition = randomInt(0, stripLength - GRID_ROWS - 1);

        for (let i = 0; i < GRID_ROWS && i < targetSymbols.length; i++) {
            const stripIndex = (injectPosition + i) % stripLength;
            const symbol = this.symbols[stripIndex];
            const texture = this.symbolTextures.get(targetSymbols[i].id);

            if (!texture) {
                throw new Error(
                    `Missing texture for symbol: ${targetSymbols[i].id}. Game state is corrupted.`
                );
            }

            symbol.texture = texture;
            symbol.symbolConfig = targetSymbols[i];
        }

        return injectPosition;
    }

    private calculateSpinDistance(targetSymbols: SymbolConfig[]): number {
        const stripLength = this.symbols.length;
        const injectPosition = this.injectTargetSymbols(targetSymbols);
        const currentTopIndex = this.findCurrentTopSymbolIndex();

        // The strip is circular: when symbols move down visually, we're advancing through
        // the strip indices in reverse. To land injectPosition at row 0, we need to advance
        // from currentTopIndex back to injectPosition, wrapping around if necessary.
        let positionsToAdvance = currentTopIndex - injectPosition;
        if (positionsToAdvance <= 0) {
            positionsToAdvance += stripLength;
        }

        positionsToAdvance += MIN_SPIN_ROTATIONS * stripLength;

        return positionsToAdvance * this.symbolHeight;
    }

    private updateSpinAnimation(): void {
        if (!this.isSpinning || !this.animationState) return;

        const elapsed = performance.now() - this.spinStartTime;
        const progress = Math.min(1, elapsed / SPIN_DURATION_MS);

        // Ease-out cubic: starts fast, ends slow for natural deceleration
        const eased = 1 - Math.pow(1 - progress, EASE_OUT_CUBIC_POWER);
        const nextDistance = this.animationState.targetDistance * eased;
        // Calculate incremental step to move this frame based on total progress
        const step = nextDistance - this.animationState.distanceTraveled;

        this.symbols.forEach((symbol) => {
            symbol.y += step;

            if (symbol.y - this.symbolHeight / 2 >= INNER_HEIGHT) {
                symbol.y -= this.symbolHeight * this.symbols.length;
            }
        });

        this.animationState.distanceTraveled = nextDistance;
    }

    private isSpinComplete(): boolean {
        if (!this.animationState) return true;

        const elapsed = performance.now() - this.spinStartTime;
        const distanceComplete =
            this.animationState.distanceTraveled >= this.animationState.targetDistance;
        const timeComplete = elapsed >= SPIN_DURATION_MS;

        return distanceComplete || timeComplete;
    }

    private spin(targetSymbols: SymbolConfig[]): void {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.spinStartTime = performance.now();

        const targetDistance = this.calculateSpinDistance(targetSymbols);
        this.animationState = {
            targetDistance,
            distanceTraveled: 0,
        };

        this.currentTicker.add(this.animate);
    }

    private animate = (): void => {
        this.updateSpinAnimation();

        if (this.isSpinComplete()) {
            this.stop();
            this.currentTicker.remove(this.animate);
            this.eventBus.emitReelSpinCompleted({
                reelIndex: this.reelIndex,
            });
        }
    };

    private stop(): void {
        this.isSpinning = false;
        this.animationState = undefined;

        this.symbols.forEach((symbol) => {
            const targetRow = Math.round((symbol.y - this.symbolHeight / 2) / this.symbolHeight);
            symbol.y = targetRow * this.symbolHeight + this.symbolHeight / 2;
        });
    }

    setHighlightedRows(rows: ReadonlySet<number>): void {
        this.cellBackgrounds.forEach((cell, row) => {
            cell.tint = rows.has(row) ? REEL_HIGHLIGHT_COLOR : REEL_NORMAL_TINT;
        });
    }

    startBlink(rows: ReadonlySet<number>, ticker: Ticker): void {
        this.stopBlink(false);
        if (rows.size === 0) return;

        this.blinkTicker = ticker;
        this.setHighlightedRows(rows);
        const startTime = performance.now();

        this.blinkCallback = () => {
            const elapsed = performance.now() - startTime;
            // Toggle every BLINK_INTERVAL_MS: floor(elapsed/interval) gives us which "phase" we're in
            // Even phases (0,2,4...) show highlight, odd phases (1,3,5...) hide it
            const shouldBeOn = Math.floor(elapsed / BLINK_INTERVAL_MS) % 2 === 0;
            this.setHighlightedRows(shouldBeOn ? rows : EMPTY_ROW_SET);

            if (elapsed >= BLINK_DURATION_MS) {
                if (this.blinkTicker && this.blinkCallback) {
                    this.blinkTicker.remove(this.blinkCallback);
                }
                this.blinkTicker = undefined;
                this.blinkCallback = undefined;
                this.setHighlightedRows(rows);
            }
        };

        ticker.add(this.blinkCallback);
    }

    stopBlink(clearHighlight = true): void {
        if (this.blinkTicker && this.blinkCallback) {
            this.blinkTicker.remove(this.blinkCallback);
        }
        this.blinkTicker = undefined;
        this.blinkCallback = undefined;
        if (clearHighlight) {
            this.setHighlightedRows(EMPTY_ROW_SET);
        }
    }

    destroy(): void {
        this.unsubscribers.forEach((unsub) => unsub());
        this.unsubscribers = [];
        this.currentTicker.remove(this.animate);
        this.stopBlink();

        super.destroy();
    }
}
