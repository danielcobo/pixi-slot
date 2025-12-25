import type { SymbolConfig } from '../../config';
import type { SpinResult } from '../../slotEngine';

export const UI_EVENTS = {
    SPIN_REQUESTED: 'spin:requested',
    SPIN_STARTED: 'spin:started',
    SPIN_COMPLETED: 'spin:completed',

    REEL_SPIN_STARTED: 'reel:spin:started',
    REEL_SPIN_COMPLETED: 'reel:spin:completed',

    BET_CHANGED: 'bet:changed',

    WIN_OCCURRED: 'win:occurred',

    GAME_STATE_CHANGED: 'game:state:changed',
} as const;

export interface SpinRequestedEvent {
    forcedGrid?: SpinResult['grid'];
}

interface SpinStartedEvent {
    bet: number;
    balanceAfterBet: number;
}

interface SpinCompletedEvent {
    result: SpinResult;
    totalWinnings: number;
    finalBalance: number;
}

interface ReelSpinStartedEvent {
    reelIndex: number;
    targetSymbols: SymbolConfig[];
}

interface ReelSpinCompletedEvent {
    reelIndex: number;
}

interface BetChangedEvent {
    oldBet: number;
    newBet: number;
    balance: number;
}

interface WinOccurredEvent {
    winningRows: Set<number>;
    lineWins: SpinResult['lineWins'];
    totalWinnings: number;
}

export type GameState = 'idle' | 'spinning' | 'showing-win' | 'insufficient-balance';

interface GameStateChangedEvent {
    oldState: GameState;
    newState: GameState;
    canSpin: boolean;
    canChangeBet: boolean;
}

import { EventBus } from './EventBus';

export class UIEventBus extends EventBus {
    // Spin events
    onSpinRequested(callback: (data: SpinRequestedEvent) => void) {
        return this.on<SpinRequestedEvent>(UI_EVENTS.SPIN_REQUESTED, callback);
    }

    onSpinStarted(callback: (data: SpinStartedEvent) => void) {
        return this.on<SpinStartedEvent>(UI_EVENTS.SPIN_STARTED, callback);
    }

    onSpinCompleted(callback: (data: SpinCompletedEvent) => void) {
        return this.on<SpinCompletedEvent>(UI_EVENTS.SPIN_COMPLETED, callback);
    }

    // Reel events
    onReelSpinStarted(callback: (data: ReelSpinStartedEvent) => void) {
        return this.on<ReelSpinStartedEvent>(UI_EVENTS.REEL_SPIN_STARTED, callback);
    }

    onReelSpinCompleted(callback: (data: ReelSpinCompletedEvent) => void) {
        return this.on<ReelSpinCompletedEvent>(UI_EVENTS.REEL_SPIN_COMPLETED, callback);
    }

    // Bet events
    onBetChanged(callback: (data: BetChangedEvent) => void) {
        return this.on<BetChangedEvent>(UI_EVENTS.BET_CHANGED, callback);
    }

    // Win events
    onWinOccurred(callback: (data: WinOccurredEvent) => void) {
        return this.on<WinOccurredEvent>(UI_EVENTS.WIN_OCCURRED, callback);
    }

    // State events
    onGameStateChanged(callback: (data: GameStateChangedEvent) => void) {
        return this.on<GameStateChangedEvent>(UI_EVENTS.GAME_STATE_CHANGED, callback);
    }

    // Emit helpers with type safety
    emitSpinRequested(data: SpinRequestedEvent) {
        this.emit(UI_EVENTS.SPIN_REQUESTED, data);
    }

    emitSpinStarted(data: SpinStartedEvent) {
        this.emit(UI_EVENTS.SPIN_STARTED, data);
    }

    emitSpinCompleted(data: SpinCompletedEvent) {
        this.emit(UI_EVENTS.SPIN_COMPLETED, data);
    }

    emitReelSpinStarted(data: ReelSpinStartedEvent) {
        this.emit(UI_EVENTS.REEL_SPIN_STARTED, data);
    }

    emitReelSpinCompleted(data: ReelSpinCompletedEvent) {
        this.emit(UI_EVENTS.REEL_SPIN_COMPLETED, data);
    }

    emitBetChanged(data: BetChangedEvent) {
        this.emit(UI_EVENTS.BET_CHANGED, data);
    }

    emitWinOccurred(data: WinOccurredEvent) {
        this.emit(UI_EVENTS.WIN_OCCURRED, data);
    }

    emitGameStateChanged(data: GameStateChangedEvent) {
        this.emit(UI_EVENTS.GAME_STATE_CHANGED, data);
    }
}
