import type { Application, Container, Texture } from 'pixi.js';
import {
    GRID_COLUMNS,
    INNER_WIDTH,
    MAX_SCREEN_SIZE_PERCENTAGE,
    RESIZE_DEBOUNCE_MS,
    UI_HEIGHT,
    UI_WIDTH,
} from '../config';
import type { EventCleanupManager } from '../utils/eventCleanup';

export function getGridLayout(separatorTexture: Texture): {
    separatorWidth: number;
    reelWidth: number;
} {
    const separatorWidth = separatorTexture.width;

    const numberOfSeparators = GRID_COLUMNS - 1;
    if (numberOfSeparators <= 0) {
        return {
            separatorWidth,
            reelWidth: INNER_WIDTH / GRID_COLUMNS,
        };
    }
    const totalSeparatorWidth = numberOfSeparators * separatorWidth;
    const reelWidth = (INNER_WIDTH - totalSeparatorWidth) / GRID_COLUMNS;
    return { separatorWidth, reelWidth };
}

function debounce(func: () => void, waitMs: number): () => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func();
        }, waitMs);
    };
}

export function updateSlotMachineLayout(app: Application, slotMachine: Container) {
    const maxWidth = app.screen.width * MAX_SCREEN_SIZE_PERCENTAGE;
    const maxHeight = app.screen.height * MAX_SCREEN_SIZE_PERCENTAGE;
    const scale = Math.min(maxWidth / UI_WIDTH, maxHeight / UI_HEIGHT);

    slotMachine.scale.set(scale);
    slotMachine.position.set(
        (app.screen.width - UI_WIDTH * scale) / 2,
        (app.screen.height - UI_HEIGHT * scale) / 2
    );
}

export function createResizeHandler(
    app: Application,
    slotMachine: Container,
    cleanupManager: EventCleanupManager
) {
    const onResize = () => updateSlotMachineLayout(app, slotMachine);
    onResize();
    const debouncedResize = debounce(onResize, RESIZE_DEBOUNCE_MS);
    cleanupManager.addWindowListener('resize', debouncedResize);
}
