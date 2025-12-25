import { Sprite } from 'pixi.js';
import type { Container, Texture } from 'pixi.js';
import { ANCHOR_CENTER, GRID_COLUMNS } from '../../config';

export function createReelSeparators(
    reelFrameInternal: Container,
    separatorTexture: Texture,
    reelWidth: number,
    separatorWidth: number
) {
    const numberOfSeparators = GRID_COLUMNS - 1;
    if (numberOfSeparators <= 0) {
        return;
    }

    // Position separators between reels
    // Layout: [Reel1][Sep1][Reel2][Sep2][Reel3]...
    // Separator i should be positioned after i reels and (i-1) separators
    // With anchor center, x is the separator CENTER, so we add + separatorWidth/2
    for (let i = 1; i <= numberOfSeparators; i++) {
        const separator = Sprite.from(separatorTexture);
        separator.label = `reelSeparator${i}`;
        separator.anchor.set(ANCHOR_CENTER, 0);
        const xPosition = i * reelWidth + (i - 1) * separatorWidth + separatorWidth / 2;
        separator.position.set(xPosition, 0);
        reelFrameInternal.addChild(separator);
    }
}
