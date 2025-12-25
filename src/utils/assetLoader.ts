import { Assets, type Texture } from 'pixi.js';

const FONT_FAMILY = 'Pixelify Sans';
const FONT_PATH = '/assets/fonts/PixelifySans-Bold.ttf';

let fontLoaded = false;

/**
 * Resolve asset path with base URL for deployment
 */
function resolveAssetPath(path: string): string {
    const base = import.meta.env.BASE_URL;
    // Remove leading slash from path if base already ends with one
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return base + cleanPath;
}

export async function loadFont(): Promise<void> {
    if (fontLoaded) return;

    try {
        const fontPath = resolveAssetPath(FONT_PATH);
        const fontFace = new FontFace(FONT_FAMILY, `url(${fontPath})`, {
            weight: 'bold',
        });
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
        fontLoaded = true;
    } catch (error) {
        throw new Error(`Failed to load font from ${FONT_PATH}: ${error}`);
    }
}

export async function loadTexture(path: string, assetName: string = path): Promise<Texture> {
    try {
        const resolvedPath = resolveAssetPath(path);
        return await Assets.load(resolvedPath);
    } catch (error) {
        throw new Error(`Failed to load texture "${assetName}" from ${path}: ${error}`);
    }
}

/**
 * Load multiple textures in parallel with error handling.
 *
 * @param texturePaths - Array of texture paths or objects with path and name
 * @returns Map of texture names to loaded textures
 * @throws Error if any texture fails to load
 */
export async function loadTextures(
    texturePaths: Array<string | { path: string; name: string }>
): Promise<Map<string, Texture>> {
    const textureMap = new Map<string, Texture>();

    try {
        const results = await Promise.all(
            texturePaths.map(async (item) => {
                const path = typeof item === 'string' ? item : item.path;
                const name = typeof item === 'string' ? path : item.name;
                const texture = await loadTexture(path, name);
                return { name, texture };
            })
        );

        results.forEach(({ name, texture }) => {
            textureMap.set(name, texture);
        });

        return textureMap;
    } catch (error) {
        throw new Error(`Failed to load one or more textures: ${error}`);
    }
}

export { FONT_FAMILY };
