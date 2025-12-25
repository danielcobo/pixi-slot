/**
 * Spin Coordinator - Orchestrates spin sequence using events
 *
 * This replaces the god-class buttonSpin logic by coordinating the spin
 * sequence through events without directly coupling components.
 */

import { Ticker } from 'pixi.js';
import type { GameController } from '../controllers/gameController';
import { GRID_ROWS, REEL_STAGGER_DELAY_MS, type SymbolConfig } from '../config';
import type { SpinResult } from '../slotEngine';
import { logger } from '../utils/logger';
import { UIEventBus, type GameState, type SpinRequestedEvent } from './events';

const extractWinningRows = (lineWins: SpinResult['lineWins']): Set<number> => {
    const rows = new Set<number>();
    lineWins.forEach((win) => {
        const [, rowString] = win.paylineId.split('_');
        const row = Number(rowString);
        if (Number.isFinite(row)) rows.add(row);
    });
    return rows;
};

const extractTargetSymbols = (grid: SpinResult['grid'], col: number): SymbolConfig[] => {
    const targetSymbols: SymbolConfig[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        targetSymbols.push(grid[row][col]);
    }
    return targetSymbols;
};

export class SpinCoordinator {
    private controller: GameController;
    private eventBus: UIEventBus;
    private reelCount: number;
    private currentState: GameState = 'idle';
    private completedReels = 0;
    private currentSpinResult?: SpinResult;
    private currentCompleteCallback?: () => void;

    constructor(
        controller: GameController,
        eventBus: UIEventBus,
        _ticker: Ticker,
        reelCount: number
    ) {
        this.controller = controller;
        this.eventBus = eventBus;
        this.reelCount = reelCount;

        this.eventBus.onSpinRequested(this.handleSpinRequested.bind(this));
        this.eventBus.onReelSpinCompleted(this.handleReelCompleted.bind(this));
        this.updateGameState('idle');
    }

    private updateGameState(newState: GameState): void {
        const oldState = this.currentState;
        this.currentState = newState;

        const canSpin = this.controller.canPlaceSpin() && newState === 'idle';
        const canChangeBet = newState === 'idle';

        this.eventBus.emitGameStateChanged({
            oldState,
            newState,
            canSpin,
            canChangeBet,
        });
    }

    private handleSpinRequested = (event: SpinRequestedEvent): void => {
        if (this.currentState !== 'idle') {
            return;
        }

        if (!this.controller.canPlaceSpin()) {
            if (event.forcedGrid) {
                logger.warn('Cannot force win: insufficient balance');
            }
            this.updateGameState('insufficient-balance');
            return;
        }

        this.startSpin(event.forcedGrid);
    };

    private startSpin(forcedGrid?: SpinResult['grid']): void {
        this.updateGameState('spinning');
        this.completedReels = 0;

        const spinResult = this.controller.startSpin(forcedGrid);
        this.currentSpinResult = spinResult.result;
        this.currentCompleteCallback = spinResult.complete;

        const spinType = forcedGrid ? 'Forced WIN' : 'Spinning';
        const outcome = spinResult.lineWins.length > 0 ? 'WIN' : 'LOSS';
        logger.info(`${spinType}... ${outcome} - ${spinResult.lineWins.length} line(s)`);

        if (spinResult.totalWinnings > 0) {
            const winDetails = spinResult.lineWins
                .map((w) => `${w.paylineId}: ${w.explanation}`)
                .join(', ');
            const prefix = forcedGrid ? 'Forced WIN!' : 'Win!';
            logger.info(
                `${prefix} ${winDetails} | Total: ${spinResult.totalWinnings}, Balance: ${spinResult.finalBalance}`
            );
        } else {
            logger.info(`No win. Balance: ${spinResult.balanceAfterBet}`);
        }

        this.eventBus.emitSpinStarted({
            bet: spinResult.bet,
            balanceAfterBet: spinResult.balanceAfterBet,
        });

        this.startReelAnimations(spinResult.result);
    }

    private startReelAnimations(result: SpinResult): void {
        for (let col = 0; col < this.reelCount; col++) {
            setTimeout(() => {
                const targetSymbols = extractTargetSymbols(result.grid, col);
                this.eventBus.emitReelSpinStarted({
                    reelIndex: col,
                    targetSymbols,
                });
            }, col * REEL_STAGGER_DELAY_MS);
        }
    }

    private handleReelCompleted = (): void => {
        this.completedReels++;

        if (this.completedReels === this.reelCount) {
            this.handleAllReelsStopped();
        }
    };

    private handleAllReelsStopped(): void {
        if (!this.currentSpinResult || !this.currentCompleteCallback) {
            logger.error('Spin complete but no result available');
            this.updateGameState('idle');
            return;
        }

        this.currentCompleteCallback();

        const result = this.currentSpinResult;
        const hasWin = result.lineWins.length > 0;

        this.eventBus.emitSpinCompleted({
            result,
            totalWinnings: result.totalWinMultiplier * this.controller.getBet(),
            finalBalance: this.controller.getBalance(),
        });

        if (hasWin) {
            const winningRows = extractWinningRows(result.lineWins);
            this.eventBus.emitWinOccurred({
                winningRows,
                lineWins: result.lineWins,
                totalWinnings: result.totalWinMultiplier * this.controller.getBet(),
            });
            this.updateGameState('showing-win');
            // Small delay for state transition; actual win display handled by reels
            setTimeout(() => {
                this.updateGameState('idle');
            }, 100);
        } else {
            this.updateGameState('idle');
        }

        this.currentSpinResult = undefined;
        this.currentCompleteCallback = undefined;
    }

    destroy(): void {
        this.eventBus.off();
    }
}
