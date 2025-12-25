import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import {
    ANCHOR_CENTER,
    DEFAULT_DEVICE_PIXEL_RATIO,
    FIELD_DEFAULT_LABEL_FONT_SIZE,
    FIELD_DEFAULT_VALUE_FONT_SIZE,
    FIELD_HEIGHT,
    FIELD_LABEL_COLOR,
    FIELD_LABEL_Y_OFFSET,
    FIELD_VALUE_COLOR,
    FIELD_VALUE_Y_OFFSET,
} from '../../config';
import { loadFont, loadTexture, FONT_FAMILY } from '../../utils/assetLoader';

export class Field extends Container {
    private background: Sprite;
    private labelText: Text | null = null;
    private valueText: Text | null = null;
    private labelString: string;
    private valueString: string;
    private labelFontSize: number;
    private valueFontSize: number;

    constructor(
        label: string,
        value: string = '',
        name: string = 'field',
        labelFontSize: number = FIELD_DEFAULT_LABEL_FONT_SIZE,
        valueFontSize: number = FIELD_DEFAULT_VALUE_FONT_SIZE
    ) {
        super();

        this.labelString = label;
        this.valueString = value;
        this.labelFontSize = labelFontSize;
        this.valueFontSize = valueFontSize;
        this.label = name;

        this.background = new Sprite();
        this.background.anchor.set(ANCHOR_CENTER);
        this.addChild(this.background);
    }

    async load(): Promise<void> {
        const [texture] = await Promise.all([
            loadTexture('/assets/images/Field.png', 'Field'),
            loadFont(),
        ]);

        this.background.texture = texture;

        const scale = FIELD_HEIGHT / texture.height;
        this.background.scale.set(scale);

        // Top label (cyan/green)
        const labelStyle = new TextStyle({
            fontFamily: FONT_FAMILY,
            fontSize: this.labelFontSize,
            fontWeight: 'bold',
            fill: FIELD_LABEL_COLOR,
            align: 'center',
        });

        this.labelText = new Text({
            text: this.labelString,
            style: labelStyle,
            resolution: window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
        });
        this.labelText.anchor.set(ANCHOR_CENTER);
        this.labelText.y = FIELD_LABEL_Y_OFFSET;
        this.addChild(this.labelText);

        // Bottom value (white)
        const valueStyle = new TextStyle({
            fontFamily: FONT_FAMILY,
            fontSize: this.valueFontSize,
            fontWeight: 'bold',
            fill: FIELD_VALUE_COLOR,
            align: 'center',
        });

        this.valueText = new Text({
            text: this.valueString,
            style: valueStyle,
            resolution: window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
        });
        this.valueText.anchor.set(ANCHOR_CENTER);
        this.valueText.y = FIELD_VALUE_Y_OFFSET;
        this.addChild(this.valueText);
    }

    setLabel(label: string): void {
        if (this.labelText) {
            this.labelText.text = label;
        }
    }

    getLabel(): string {
        return this.labelText?.text ?? this.labelString;
    }

    setValue(value: string): void {
        if (this.valueText) {
            this.valueText.text = value;
        }
    }

    getValue(): string {
        return this.valueText?.text ?? this.valueString;
    }

    setLabelFontSize(size: number): void {
        if (this.labelText) {
            this.labelText.style.fontSize = size;
        }
    }

    setValueFontSize(size: number): void {
        if (this.valueText) {
            this.valueText.style.fontSize = size;
        }
    }

    setLabelColor(color: number): void {
        if (this.labelText) {
            this.labelText.style.fill = color;
        }
    }

    setValueColor(color: number): void {
        if (this.valueText) {
            this.valueText.style.fill = color;
        }
    }
}

export const createField = async (
    label: string,
    value: string = '',
    name: string = 'field',
    labelFontSize?: number,
    valueFontSize?: number
): Promise<Field> => {
    const field = new Field(label, value, name, labelFontSize, valueFontSize);
    await field.load();
    return field;
};
