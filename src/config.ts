// Layout and dimensions
export const UI_WIDTH = 974;
export const UI_HEIGHT = 1140;

export const INNER_LEFT = 64;
export const INNER_TOP = 64;
export const INNER_WIDTH = 854;
export const INNER_HEIGHT = 751;

export const GRID_COLUMNS = 5;
export const GRID_ROWS = 5;

// Rendering configuration
export const DEFAULT_DEVICE_PIXEL_RATIO = 2;
export const ANCHOR_CENTER = 0.5;

// Layout scaling and positioning
export const MAX_SCREEN_SIZE_PERCENTAGE = 0.9;
export const RESIZE_DEBOUNCE_MS = 100;
export const ERROR_MESSAGE_WORD_WRAP_WIDTH_PERCENTAGE = 0.8;

// Reel configuration
export const REEL_BACKGROUND_COLOR = 0xedfcff;
export const REEL_CELL_PADDING_X = 8;
export const SYMBOL_RENDER_HEIGHT_ADDITION = 1;

// Control bar configuration
export const CONTROL_BAR_ELEMENT_SPACING = 40;
export const CONTROL_BAR_Y_OFFSET = 80;

// Button configuration
export const BUTTON_HEIGHT = 200;
export const BUTTON_DEFAULT_FONT_SIZE = 48;
export const BUTTON_HOVER_TINT = 0x00ff00; // Bright green
export const BUTTON_NORMAL_TINT = 0xffffff; // White
export const BUTTON_DISABLED_TINT = 0x808080; // Gray
export const BUTTON_NORMAL_TEXT_COLOR = 0xffffff; // White
export const BUTTON_DISABLED_TEXT_COLOR = 0x666666; // Dark gray
export const BUTTON_CLICK_SCALE = 0.9;

// Field configuration
export const FIELD_HEIGHT = 200;
export const FIELD_DEFAULT_LABEL_FONT_SIZE = 48;
export const FIELD_DEFAULT_VALUE_FONT_SIZE = 48;
export const FIELD_LABEL_COLOR = 0x00ffaa; // Bright cyan/green
export const FIELD_VALUE_COLOR = 0xffffff; // White
export const FIELD_LABEL_Y_OFFSET = -40;
export const FIELD_VALUE_Y_OFFSET = 30;

// Error UI configuration
export const ERROR_FONT_SIZE = 48;
export const ERROR_TEXT_COLOR = 0xff0000; // Red

// Symbol configuration
export type SymbolId = 'CHERRY' | 'LEMON' | 'PLUM' | 'BELL' | 'DIAMOND' | 'SEVEN' | 'BAR' | 'WILD';

export type SymbolConfig = {
    id: SymbolId;
    texturePath: string;
    multiplier: number;
    weight: number;
    isWild?: boolean;
};

export const SYMBOL_CONFIGS: SymbolConfig[] = [
    { id: 'CHERRY', texturePath: '/assets/images/Cherry.png', multiplier: 3, weight: 60 },
    { id: 'LEMON', texturePath: '/assets/images/Lemon.png', multiplier: 5, weight: 40 },
    { id: 'PLUM', texturePath: '/assets/images/Plum.png', multiplier: 8, weight: 15 },
    { id: 'BELL', texturePath: '/assets/images/Bell.png', multiplier: 12, weight: 5 },
    { id: 'BAR', texturePath: '/assets/images/Bar.png', multiplier: 18, weight: 2 },
    { id: 'DIAMOND', texturePath: '/assets/images/Diamond.png', multiplier: 25, weight: 1.5 },
    { id: 'SEVEN', texturePath: '/assets/images/Seven.png', multiplier: 100, weight: 0.5 },
    { id: 'WILD', texturePath: '/assets/images/Wild.png', multiplier: 18, weight: 2, isWild: true },
];

export const BACKGROUND_COLOR = '#FFC571';

// Reel animation configuration
export const SPIN_DURATION_MS = 2000;
export const REEL_STAGGER_DELAY_MS = 100;
export const REEL_HIGHLIGHT_COLOR = 0xfff3a0;
export const REEL_NORMAL_TINT = 0xffffff;
export const BLINK_DURATION_MS = 2700;
export const BLINK_INTERVAL_MS = 300;
export const MIN_SPIN_ROTATIONS = 2;
export const EASE_OUT_CUBIC_POWER = 3;

// UI Button configuration
export const BET_BUTTON_SCALE = 0.45;
export const BET_BUTTON_FONT_SIZE = 80;
export const BET_BUTTON_VERTICAL_SPACING = 10;

// Game configuration
export const MIN_BET = 10;
export const BET_INCREMENT = 10;
export const INITIAL_BALANCE = 100;
