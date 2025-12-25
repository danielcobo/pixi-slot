import { createButton, type Button } from './button';
import type { EventCleanupManager } from '../../utils/eventCleanup';
import { generateWinningGrid } from '../../slotEngine';
import type { UIEventBus } from '../events';

export async function createButtonSpin(
    eventBus: UIEventBus,
    cleanupManager: EventCleanupManager
): Promise<Button> {
    const button = await createButton('SPIN', 'spinButton');

    button.on('pointerdown', () => {
        eventBus.emitSpinRequested({});
    });

    const keydownHandler = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() === 'w') {
            eventBus.emitSpinRequested({ forcedGrid: generateWinningGrid() });
        }
    };
    cleanupManager.addWindowListener('keydown', keydownHandler);

    eventBus.onGameStateChanged((state) => {
        button.setDisabled(!state.canSpin);
    });

    return button;
}
