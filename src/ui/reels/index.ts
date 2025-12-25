import { Container, Texture, Ticker } from 'pixi.js';
import {
    GRID_COLUMNS,
    GRID_ROWS,
    INNER_HEIGHT,
    SYMBOL_CONFIGS,
    SYMBOL_RENDER_HEIGHT_ADDITION,
    type SymbolConfig,
} from '../../config';
import { loadTextures } from '../../utils/assetLoader';
import { randomInt } from '../../utils/rng';
import { Reel } from './reel';
import { Symbol } from './symbol';
import type { UIEventBus } from '../events';

const createFixedReelStrip = (): SymbolConfig[] => {
    const strip: SymbolConfig[] = [];

    // Build strip with weighted probability: each symbol appears proportional to its weight.
    // A symbol with weight=10 appears 10 times, making it 10x more likely than weight=1.
    SYMBOL_CONFIGS.forEach((config) => {
        const count = Math.ceil(config.weight);
        for (let i = 0; i < count; i++) {
            strip.push(config);
        }
    });

    // Fisher-Yates shuffle to randomize symbol order on the strip
    for (let i = strip.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [strip[i], strip[j]] = [strip[j], strip[i]];
    }

    return strip;
};

export async function createReels(
    reelFrameInternal: Container,
    reelWidth: number,
    separatorWidth: number,
    eventBus: UIEventBus,
    ticker: Ticker
): Promise<Reel[]> {
    const symbolHeight = Math.ceil(INNER_HEIGHT / GRID_ROWS);
    const symbolRenderHeight = symbolHeight + SYMBOL_RENDER_HEIGHT_ADDITION;

    const textureMap: Map<string, Texture> = await loadTextures(
        SYMBOL_CONFIGS.map((config) => ({
            path: config.texturePath,
            name: config.id,
        }))
    );

    const reels: Reel[] = [];

    for (let reelIndex = 0; reelIndex < GRID_COLUMNS; reelIndex++) {
        const reel = new Reel(reelIndex, reelWidth, symbolHeight, separatorWidth, eventBus, ticker);

        reel.setSymbolTextures(textureMap);

        const reelStrip = createFixedReelStrip();

        for (let symbolIndex = 0; symbolIndex < reelStrip.length; symbolIndex++) {
            const config = reelStrip[symbolIndex];
            const texture = textureMap.get(config.id);
            if (texture) {
                const symbol = new Symbol(
                    texture,
                    symbolIndex,
                    reelWidth,
                    symbolHeight,
                    symbolRenderHeight,
                    config
                );
                reel.addSymbol(symbol, symbolIndex);
            }
        }

        reelFrameInternal.addChild(reel);
        reels.push(reel);
    }

    return reels;
}
