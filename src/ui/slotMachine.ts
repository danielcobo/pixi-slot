import { Application, Container, Sprite } from 'pixi.js';
import { GRID_COLUMNS } from '../config';
import { GameController } from '../controllers/gameController';
import { loadTexture } from '../utils/assetLoader';
import { EventCleanupManager } from '../utils/eventCleanup';
import { createReelFrameInternal } from './reels/reelFrame';
import { createReelSeparators } from './reels/reelSeparators';
import { createReels } from './reels';
import { getGridLayout, createResizeHandler } from './layout';
import { createControlBar } from './controlBar';
import { UIEventBus } from './events';
import { SpinCoordinator } from './spinCoordinator';

export interface SlotMachineContext {
    cleanup: () => void;
}

/**
 * Create and initialize the complete slot machine UI.
 * Set up all visual components, event handlers, and return cleanup function.
 *
 * @param app - PixiJS Application instance
 * @returns Context object with cleanup function for proper teardown
 */
export async function createSlotMachine(app: Application): Promise<SlotMachineContext> {
    const cleanupManager = new EventCleanupManager();
    const controller = new GameController();
    const eventBus = new UIEventBus();

    const reelFrameInternal = createReelFrameInternal();
    const reelFrameTexture = await loadTexture('/assets/images/reelFrame.png', 'Reel Frame');
    const reelFrame = Sprite.from(reelFrameTexture);
    reelFrame.label = 'reelFrame';

    const slotMachine = new Container();
    slotMachine.label = 'slotMachine';
    // Order matters: internal first (behind), frame second (on top)
    slotMachine.addChild(reelFrameInternal);
    slotMachine.addChild(reelFrame);

    const separatorTexture = await loadTexture(
        '/assets/images/ReelSeperator.png',
        'Reel Separator'
    );
    const { separatorWidth, reelWidth } = getGridLayout(separatorTexture);

    await createReels(reelFrameInternal, reelWidth, separatorWidth, eventBus, app.ticker);
    createReelSeparators(reelFrameInternal, separatorTexture, reelWidth, separatorWidth);

    const spinCoordinator = new SpinCoordinator(controller, eventBus, app.ticker, GRID_COLUMNS);

    const controlBar = await createControlBar(controller, eventBus, cleanupManager);

    slotMachine.addChild(controlBar);

    app.stage.addChild(slotMachine);
    createResizeHandler(app, slotMachine, cleanupManager);

    return {
        cleanup: () => {
            cleanupManager.cleanup();
            spinCoordinator.destroy();
            eventBus.off();
        },
    };
}
