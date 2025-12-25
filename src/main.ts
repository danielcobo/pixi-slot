import { Application, Container, Text, TextStyle } from 'pixi.js';
import {
    ANCHOR_CENTER,
    BACKGROUND_COLOR,
    DEFAULT_DEVICE_PIXEL_RATIO,
    ERROR_FONT_SIZE,
    ERROR_MESSAGE_WORD_WRAP_WIDTH_PERCENTAGE,
    ERROR_TEXT_COLOR,
} from './config';
import { createSlotMachine } from './ui/slotMachine';
import { loadFont, FONT_FAMILY } from './utils/assetLoader';
import { logger } from './utils/logger';

declare global {
    interface Window {
        __slotMachineCleanup?: () => void;
    }
}

async function createApp(): Promise<Application> {
    const app = new Application();
    await app.init({
        background: BACKGROUND_COLOR,
        resizeTo: window,
        resolution: window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
        autoDensity: true,
    });

    const container = document.getElementById('pixi-container');
    if (!container) {
        throw new Error('Could not find pixi-container element');
    }

    container.appendChild(app.canvas);
    return app;
}

/**
 * Display a centered error message using the game font.
 */
async function showErrorUI(app: Application, errorMessage: string): Promise<void> {
    try {
        await loadFont();

        const errorContainer = new Container();
        errorContainer.label = 'errorContainer';

        const textStyle = new TextStyle({
            fontFamily: FONT_FAMILY,
            fontSize: ERROR_FONT_SIZE,
            fontWeight: 'bold',
            fill: ERROR_TEXT_COLOR,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: app.screen.width * ERROR_MESSAGE_WORD_WRAP_WIDTH_PERCENTAGE,
        });

        const errorText = new Text({
            text: errorMessage,
            style: textStyle,
            resolution: window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
        });

        errorText.anchor.set(ANCHOR_CENTER);
        errorText.position.set(app.screen.width / 2, app.screen.height / 2);

        errorContainer.addChild(errorText);
        app.stage.addChild(errorContainer);
    } catch (fontError) {
        // Fallback if even font loading fails
        logger.error('Could not display error UI:', fontError);
    }
}

/**
 * Main entry point for the application.
 * Creates the app and slot machine, with error handling.
 */
async function main() {
    let app: Application | undefined;
    try {
        app = await createApp();
        const slotMachine = await createSlotMachine(app);

        window.__slotMachineCleanup = slotMachine.cleanup;
    } catch (error) {
        logger.error('Failed to initialize slot machine:', error);

        if (app) {
            await showErrorUI(app, 'There was an error.\nBack with you shortly.');
        }
    }
}

main();
