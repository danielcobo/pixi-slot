import { Container, Graphics } from 'pixi.js';
import {
    INNER_HEIGHT,
    INNER_LEFT,
    INNER_TOP,
    INNER_WIDTH,
    REEL_BACKGROUND_COLOR,
} from '../../config';

export function createReelFrameInternal() {
    const reelFrameInternal = new Container();
    reelFrameInternal.label = 'reelFrameInternal';
    reelFrameInternal.position.set(INNER_LEFT, INNER_TOP);

    const background = new Graphics();
    background.label = 'reelFrameInternalBackground';
    background.rect(0, 0, INNER_WIDTH, INNER_HEIGHT);
    background.fill(REEL_BACKGROUND_COLOR);
    reelFrameInternal.addChild(background);

    return reelFrameInternal;
}
