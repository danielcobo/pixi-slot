import { Container } from 'pixi.js';
import { BET_BUTTON_SCALE, BET_BUTTON_FONT_SIZE, BET_BUTTON_VERTICAL_SPACING } from '../../config';
import { createButton } from './button';
import type { GameController } from '../../controllers/gameController';
import type { UIEventBus } from '../events';

export async function createButtonBet(
    controller: GameController,
    eventBus: UIEventBus
): Promise<Container> {
    const [plusButton, minusButton] = await Promise.all([
        createButton('+', 'plusButton', BET_BUTTON_FONT_SIZE),
        createButton('-', 'minusButton', BET_BUTTON_FONT_SIZE),
    ]);

    const container = new Container();
    container.label = 'betButtonContainer';

    plusButton.scale.set(BET_BUTTON_SCALE);
    minusButton.scale.set(BET_BUTTON_SCALE);

    const buttonHeight = plusButton.height;
    const totalHeight = buttonHeight * 2 + BET_BUTTON_VERTICAL_SPACING;
    const verticalOffset = totalHeight / 2 - buttonHeight / 2;

    plusButton.position.set(0, -verticalOffset);
    minusButton.position.set(0, verticalOffset);

    container.addChild(plusButton);
    container.addChild(minusButton);

    const updateStates = (canChangeBet: boolean) => {
        if (!canChangeBet) {
            plusButton.setDisabled(true);
            minusButton.setDisabled(true);
        } else {
            plusButton.setDisabled(!controller.canIncreaseBet());
            minusButton.setDisabled(!controller.canDecreaseBet());
        }
    };

    eventBus.onGameStateChanged((state) => {
        updateStates(state.canChangeBet);
    });

    plusButton.on('pointerdown', () => {
        if (!controller.canIncreaseBet()) return;

        const oldBet = controller.getBet();
        controller.updateBet(controller.getBetIncrement());
        const newBet = controller.getBet();

        eventBus.emitBetChanged({
            oldBet,
            newBet,
            balance: controller.getBalance(),
        });

        updateStates(true);
    });

    minusButton.on('pointerdown', () => {
        if (!controller.canDecreaseBet()) return;

        const oldBet = controller.getBet();
        controller.updateBet(-controller.getBetIncrement());
        const newBet = controller.getBet();

        eventBus.emitBetChanged({
            oldBet,
            newBet,
            balance: controller.getBalance(),
        });

        updateStates(true);
    });

    updateStates(true);

    return container;
}
