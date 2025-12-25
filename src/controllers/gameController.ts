import { SlotMachine, type SpinResult, type Grid } from '../slotEngine';
import { MIN_BET, BET_INCREMENT, INITIAL_BALANCE } from '../config';

export interface CompleteSpinResult {
    result: SpinResult;
    bet: number;
    totalWinnings: number;
    balanceAfterBet: number;
    finalBalance: number;
    lineWins: SpinResult['lineWins'];
    complete: () => void;
}

export class GameController {
    private balance: number;
    private bet: number;
    private slotMachine: SlotMachine;

    constructor(initialBalance: number = INITIAL_BALANCE, initialBet: number = MIN_BET) {
        this.balance = initialBalance;
        this.bet = Math.max(MIN_BET, Math.min(initialBet, initialBalance));
        this.slotMachine = new SlotMachine();
    }

    getBalance(): number {
        return this.balance;
    }

    getBet(): number {
        return this.bet;
    }

    getMinBet(): number {
        return MIN_BET;
    }

    getBetIncrement(): number {
        return BET_INCREMENT;
    }

    canPlaceSpin(): boolean {
        return this.balance > 0 && this.bet <= this.balance;
    }

    canIncreaseBet(): boolean {
        return this.bet < this.balance;
    }

    canDecreaseBet(): boolean {
        return this.bet > MIN_BET;
    }

    updateBet(delta: number): number {
        const newBet = this.bet + delta;
        this.bet = Math.max(MIN_BET, Math.min(newBet, this.balance));
        return this.bet;
    }

    /**
     * Execute a spin: deduct bet and generate result.
     * Call the returned `complete()` method after animation finishes to apply winnings.
     *
     * @param forcedGrid - Optional grid to force a specific result (for testing/demo)
     * @returns Spin result with complete() method to call after animation
     * @throws Error if spin cannot be placed
     */
    startSpin(forcedGrid?: Grid): CompleteSpinResult {
        if (!this.canPlaceSpin()) {
            throw new Error('Cannot spin: insufficient balance or invalid bet');
        }

        const betAmount = this.bet;

        // Deduct bet immediately
        this.balance -= betAmount;
        const balanceAfterBet = this.balance;

        // Run the spin
        const result = forcedGrid ? this.slotMachine.spin(forcedGrid) : this.slotMachine.spin();

        // Calculate winnings (but don't apply yet)
        const totalWinnings = result.totalWinMultiplier * betAmount;
        const finalBalance = this.balance + totalWinnings;

        return {
            result,
            bet: betAmount,
            totalWinnings,
            balanceAfterBet,
            finalBalance,
            lineWins: result.lineWins,
            complete: () => {
                // Apply winnings after animation completes
                this.balance += totalWinnings;

                // Adjust bet if it exceeds new balance
                if (this.bet > this.balance) {
                    this.bet = Math.max(MIN_BET, this.balance);
                }
            },
        };
    }
}
