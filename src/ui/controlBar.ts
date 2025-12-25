import { Container } from 'pixi.js';
import { CONTROL_BAR_ELEMENT_SPACING, CONTROL_BAR_Y_OFFSET, UI_HEIGHT, UI_WIDTH } from '../config';
import type { GameController } from '../controllers/gameController';
import type { EventCleanupManager } from '../utils/eventCleanup';
import type { UIEventBus } from './events';
import { createButtonBet } from './buttons/buttonBet';
import { createButtonSpin } from './buttons/buttonSpin';
import { createFieldBet } from './fields/fieldBet';
import { createFieldWin } from './fields/fieldWin';

const CONTROL_BAR_SPACING_QUARTER = CONTROL_BAR_ELEMENT_SPACING / 4;

const layoutControlBar = (
    betButtons: Container,
    betField: Container,
    winField: Container,
    spinButton: Container
): Container => {
    const controlBar = new Container();
    controlBar.label = 'controlBar';

    let x = 0;

    const betButtonWidth = betButtons.width;
    betButtons.position.set(x + betButtonWidth / 2, 0);
    controlBar.addChild(betButtons);
    x += betButtonWidth + CONTROL_BAR_SPACING_QUARTER;

    betField.position.set(x + betField.width / 2, 0);
    controlBar.addChild(betField);
    x += betField.width + CONTROL_BAR_ELEMENT_SPACING;

    winField.position.set(x + winField.width / 2, 0);
    controlBar.addChild(winField);
    x += winField.width + CONTROL_BAR_ELEMENT_SPACING;

    spinButton.position.set(x + spinButton.width / 2, 0);
    controlBar.addChild(spinButton);

    const totalWidth = x + spinButton.width;
    const centerPivot = totalWidth / 2;

    controlBar.pivot.x = centerPivot;
    controlBar.position.set(UI_WIDTH / 2, UI_HEIGHT - CONTROL_BAR_Y_OFFSET);

    return controlBar;
};

export const createControlBar = async (
    controller: GameController,
    eventBus: UIEventBus,
    cleanupManager: EventCleanupManager
): Promise<Container> => {
    const betField = await createFieldBet(controller, eventBus);
    const winField = await createFieldWin(controller, eventBus);
    const betButtons = await createButtonBet(controller, eventBus);
    const spinButton = await createButtonSpin(eventBus, cleanupManager);

    return layoutControlBar(betButtons, betField, winField, spinButton);
};
