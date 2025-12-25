import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import {
    ANCHOR_CENTER,
    BUTTON_CLICK_SCALE,
    BUTTON_DEFAULT_FONT_SIZE,
    BUTTON_DISABLED_TEXT_COLOR,
    BUTTON_DISABLED_TINT,
    BUTTON_HEIGHT,
    BUTTON_HOVER_TINT,
    BUTTON_NORMAL_TEXT_COLOR,
    BUTTON_NORMAL_TINT,
    DEFAULT_DEVICE_PIXEL_RATIO,
} from '../../config';
import { loadFont, loadTexture, FONT_FAMILY } from '../../utils/assetLoader';

export class Button extends Container {
    private background: Sprite;
    private text: Text | null = null;
    private textLabel: string;
    private textSize: number;
    private isDisabled: boolean = false;
    private baseScale: { x: number; y: number } = { x: 1, y: 1 };
    private isClicking: boolean = false;

    constructor(label: string, name: string, fontSize: number = BUTTON_DEFAULT_FONT_SIZE) {
        super();

        this.textLabel = label;
        this.textSize = fontSize;
        this.label = name;

        this.background = new Sprite();
        this.background.anchor.set(ANCHOR_CENTER);
        this.addChild(this.background);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this.onHoverStart.bind(this));
        this.on('pointerout', this.onHoverEnd.bind(this));

        this.on('pointerdown', this.onClickStart.bind(this));
        this.on('pointerup', this.onClickEnd.bind(this));
        this.on('pointerupoutside', this.onClickEnd.bind(this));
    }

    private onHoverStart(): void {
        if (this.isDisabled) return;
        this.background.tint = BUTTON_HOVER_TINT;
    }

    private onHoverEnd(): void {
        if (this.isDisabled) return;
        this.background.tint = BUTTON_NORMAL_TINT;
    }

    private onClickStart(): void {
        if (this.isDisabled) return;
        // Capture current scale before clicking
        if (!this.isClicking) {
            this.baseScale = { x: this.scale.x, y: this.scale.y };
        }
        this.isClicking = true;
        this.scale.set(
            this.baseScale.x * BUTTON_CLICK_SCALE,
            this.baseScale.y * BUTTON_CLICK_SCALE
        );
    }

    private onClickEnd(): void {
        if (this.isDisabled) return;
        this.scale.set(this.baseScale.x, this.baseScale.y);
        this.isClicking = false;
    }

    async load(): Promise<void> {
        const [texture] = await Promise.all([
            loadTexture('/assets/images/Button.png', 'Button'),
            loadFont(),
        ]);

        this.background.texture = texture;

        const scale = BUTTON_HEIGHT / texture.height;
        this.background.scale.set(scale);

        const textStyle = new TextStyle({
            fontFamily: FONT_FAMILY,
            fontSize: this.textSize,
            fontWeight: 'bold',
            fill: 0xffffff,
            align: 'center',
        });

        this.text = new Text({
            text: this.textLabel,
            style: textStyle,
            resolution: window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
        });
        this.text.anchor.set(ANCHOR_CENTER);
        this.addChild(this.text);
    }

    setDisabled(disabled: boolean): void {
        this.isDisabled = disabled;

        if (disabled) {
            this.background.tint = BUTTON_DISABLED_TINT;
            if (this.text) {
                this.text.style.fill = BUTTON_DISABLED_TEXT_COLOR;
            }
            this.eventMode = 'none';
            this.cursor = 'default';
            // Reset to base scale if currently clicking
            if (this.isClicking) {
                this.scale.set(this.baseScale.x, this.baseScale.y);
                this.isClicking = false;
            }
        } else {
            this.background.tint = BUTTON_NORMAL_TINT;
            if (this.text) {
                this.text.style.fill = BUTTON_NORMAL_TEXT_COLOR;
            }
            this.eventMode = 'static';
            this.cursor = 'pointer';
        }
    }

    getDisabled(): boolean {
        return this.isDisabled;
    }
}

export async function createButton(label: string, name: string, fontSize?: number) {
    const button = new Button(label, name, fontSize);
    await button.load();
    return button;
}
