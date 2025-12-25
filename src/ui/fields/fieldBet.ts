import { createField, type Field } from './field';
import type { GameController } from '../../controllers/gameController';
import type { UIEventBus } from '../events';

export async function createFieldBet(
    controller: GameController,
    eventBus: UIEventBus
): Promise<Field> {
    const field = await createField('BET', controller.getBet().toString(), 'betField');

    eventBus.onBetChanged((event) => {
        field.setValue(event.newBet.toString());
    });

    // Bet might be adjusted if balance is low
    eventBus.onSpinCompleted(() => {
        field.setValue(controller.getBet().toString());
    });

    return field;
}
