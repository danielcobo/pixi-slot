import { Sprite, Texture } from 'pixi.js';
import { ANCHOR_CENTER, REEL_CELL_PADDING_X, type SymbolConfig } from '../../config';

const getSymbolScaleToFitCell = (
    texture: Texture,
    symbolRenderHeight: number,
    reelWidth: number
): number => {
    const availableWidth = Math.max(1, reelWidth - REEL_CELL_PADDING_X * 2);
    const heightScale = symbolRenderHeight / texture.height;
    const widthScale = availableWidth / texture.width;
    return Math.min(heightScale, widthScale);
};

export class Symbol extends Sprite {
    readonly rowIndex: number;
    readonly symbolHeight: number;
    symbolConfig: SymbolConfig;

    constructor(
        texture: Texture,
        rowIndex: number,
        reelWidth: number,
        symbolHeight: number,
        symbolRenderHeight: number,
        symbolConfig: SymbolConfig
    ) {
        super(texture);
        this.rowIndex = rowIndex;
        this.symbolHeight = symbolHeight;
        this.symbolConfig = symbolConfig;

        this.roundPixels = true;
        this.anchor.set(ANCHOR_CENTER);

        const scale = getSymbolScaleToFitCell(texture, symbolRenderHeight, reelWidth);
        this.scale.set(scale);
        this.position.set(reelWidth / 2, rowIndex * symbolHeight + symbolHeight / 2);
    }
}
