import { describe, it, expect } from 'vitest';
import { GameController } from './gameController';
import { MIN_BET, BET_INCREMENT, INITIAL_BALANCE } from '../config';

describe('GameController', () => {
    it('should initialize with correct defaults', () => {
        const controller = new GameController();

        expect(controller.getBalance()).toBe(INITIAL_BALANCE);
        expect(controller.getBet()).toBe(MIN_BET);
        expect(controller.canPlaceSpin()).toBe(true);
    });

    it('should initialize with custom values', () => {
        const controller = new GameController(500, 50);

        expect(controller.getBalance()).toBe(500);
        expect(controller.getBet()).toBe(50);
    });

    it('should increase bet correctly', () => {
        const controller = new GameController();
        const initialBet = controller.getBet();

        controller.updateBet(BET_INCREMENT);

        expect(controller.getBet()).toBe(initialBet + BET_INCREMENT);
    });

    it('should decrease bet correctly', () => {
        const controller = new GameController(100, 30);

        controller.updateBet(-BET_INCREMENT);

        expect(controller.getBet()).toBe(20);
    });

    it('should not decrease bet below minimum', () => {
        const controller = new GameController();

        controller.updateBet(-BET_INCREMENT);

        expect(controller.getBet()).toBe(MIN_BET);
    });

    it('should not increase bet above balance', () => {
        const controller = new GameController(50);

        controller.updateBet(100);

        expect(controller.getBet()).toBe(50);
    });

    it('should deduct bet on spin', () => {
        const controller = new GameController(100, 10);
        const initialBalance = controller.getBalance();

        const result = controller.startSpin();

        expect(controller.getBalance()).toBe(initialBalance - 10);
        expect(result.bet).toBe(10);
    });

    it('should apply winnings after complete', () => {
        const controller = new GameController(100, 10);

        const result = controller.startSpin();
        const balanceAfterBet = controller.getBalance();

        result.complete();

        expect(controller.getBalance()).toBe(balanceAfterBet + result.totalWinnings);
    });

    it('should not allow spin with insufficient balance', () => {
        const controller = new GameController(5);

        expect(() => controller.startSpin()).toThrow();
    });

    it('should adjust bet in complete when balance drops below bet', () => {
        const controller = new GameController(10, 10);

        const result = controller.startSpin();
        // Balance is now 0, but bet is still 10
        expect(controller.getBalance()).toBe(0);
        expect(controller.getBet()).toBe(10);

        // After complete(), bet should be adjusted to match balance
        result.complete();
        expect(controller.getBet()).toBe(MIN_BET);
    });

    it('should validate bet state', () => {
        const controller = new GameController(100, 20);

        expect(controller.canIncreaseBet()).toBe(true);
        expect(controller.canDecreaseBet()).toBe(true);
    });

    it('should not allow bet decrease at minimum', () => {
        const controller = new GameController();

        expect(controller.canDecreaseBet()).toBe(false);
    });

    it('should not allow bet increase at balance', () => {
        const controller = new GameController(10);

        expect(controller.canIncreaseBet()).toBe(false);
    });
});
