import { createField, type Field } from './field';
import type { GameController } from '../../controllers/gameController';
import type { UIEventBus } from '../events';

export async function createFieldWin(
    controller: GameController,
    eventBus: UIEventBus
): Promise<Field> {
    const field = await createField('WIN', controller.getBalance().toString(), 'winField');

    // Shows balance after bet deduction
    eventBus.onSpinStarted((event) => {
        field.setValue(event.balanceAfterBet.toString());
    });

    // Shows final balance with winnings
    eventBus.onSpinCompleted((event) => {
        field.setValue(event.finalBalance.toString());
    });

    return field;
}
