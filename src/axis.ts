

import * as assembly from "./assembly";
import * as frame from "./frame";
import * as calculations from "./calculations";
import * as tsvector from "tsvector";

export class Axis extends assembly.Assembly {
    minimum: number;
    maximum: number;
    referenceValue: number|null = null;
    referencePoint: tsvector.Vector = [0, 0];
    direction: tsvector.Vector = [0, 1];
    tickValues: number[] | null = null;
    numTicks: number = 5;
    //tickLabelFont: string | null = null; use textFont
    tickAlignment: CanvasTextAlign = "left";
    tickValignment: CanvasTextBaseline = "middle";
    tickPixelOffset: number = 10;
    tickRotationDegrees: number | null = null;
    scale: number = 1;
    constructor(onFrame: frame.Frame, minimum: number, maximum: number) {
        super(onFrame);
        this.minimum = minimum;
        this.maximum = maximum;
    };
    aligned(tickAlignment: CanvasTextAlign): this {
        this.tickAlignment = tickAlignment;
        return this;
    };
    valigned(tickValignment: CanvasTextBaseline): this {
        this.tickValignment = tickValignment;
        return this;
    };
    // one pixel length in canvas space in the direction -90 degrees from the axis direction, used for tick labels
    pixelVector(): tsvector.Vector {
        if (!this.onFrame) {
            throw new Error("Axis is not on a frame.");
        }
        const frame = this.onFrame;
        const pixelDirection = frame.modelVectorToPixelVector(this.direction);
        const length = tsvector.vLength(pixelDirection);
        if (length === 0) {
            throw new Error("Axis direction cannot be zero.");
        }
        const rotatedPixelDirection = calculations.rotate2dDegrees(pixelDirection, -90);
        const unitPixelVector = tsvector.vScale(1 / length, rotatedPixelDirection);
        return unitPixelVector;
    }
    from(referenceValue: number, referencePoint: tsvector.Vector): this {
        this.referenceValue = referenceValue;
        this.referencePoint = referencePoint;
        this.setTranslation(referencePoint);
        return this;
    };
    towards(direction: tsvector.Vector): this {
        // normalize the direction vector
        const length = tsvector.vLength(direction);
        if (length === 0) {
            throw new Error("Direction vector cannot be zero.");
        }
        this.direction = tsvector.vScale(1 / length, direction);
        return this;
    };
    ticks(tickValues: number[]): this {
        this.tickValues = tickValues;
        return this;
    };
    maxTicks(length: number): this {
        this.numTicks = length;
        return this;
    };
    rotateTicks(rotationDegrees: number): this {
        this.tickRotationDegrees = rotationDegrees;
        return this;
    };
    valueToPosition(value: number): tsvector.Vector {
        let referenceValue = this.referenceValue;
        if (referenceValue === null) {
            referenceValue = this.minimum;
        }
        const offset = value - referenceValue;
        const scaled = offset * this.scale;
        const position = tsvector.vAdd(this.referencePoint, tsvector.vScale(scaled, this.direction));
        return position;
    };
    assemble(onFrame: frame.Frame): void {
        debugger;
        const lineStart = this.valueToPosition(this.minimum);
        const lineEnd = this.valueToPosition(this.maximum);
        onFrame.line(lineStart, lineEnd).styleLike(this).stroked();
        let ticks: number[];
        let tickrotationDegrees = this.tickRotationDegrees || 0;
        if (this.tickValues) {
            ticks = this.tickValues;
        } else {
            const [anchor, niceStep, offset, tickValues] = calculations.ticklist(this.minimum, this.maximum, this.numTicks);
            ticks = tickValues;
        }
        console.log("ticks", ticks);
        const pixelVector = this.pixelVector();
        if (this.tickRotationDegrees === null) {
            // compute the tick rotation from the pixelVector
            tickrotationDegrees = calculations.vectorToAngleDegrees(pixelVector);
        }
        const tickPixelShift = tsvector.vScale(this.tickPixelOffset, pixelVector);
        const tickModelShift = onFrame.pixelVectorToModelVector(tickPixelShift);
        for (const tickValue of ticks) {
            const tickPosition = this.valueToPosition(tickValue);
            const tickPixelPosition = onFrame.toPixel(tickPosition);
            const tickLabelPixelPosition = tsvector.vAdd(tickPixelPosition, tickPixelShift);
            const tickLabelPosition = onFrame.toModel(tickLabelPixelPosition);
            const tickLineEnd = tsvector.vAdd(tickPosition, tickModelShift);
            onFrame.line(tickPosition, tickLineEnd);
            const tickLabel = this.tickString(tickValue);
            onFrame.textBox(tickLabelPosition, tickLabel, [0, 0], this.tickAlignment, null)
                .styleLike(this)
                .valigned(this.tickValignment)
                .degrees(tickrotationDegrees);
        }
    };
    tickString(value: number): string {
        return " " + value.toString() + " ";
    }
};