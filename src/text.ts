import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
//import * as marking from './marking';
import * as rect from './rect';
import ts from 'typescript';
import * as conveniences from './conveniences';

/**
 * A text box marking.
 * Can be rotated, aligned, and optionally have a background box.
 */
export class TextBox extends rect.Rectangle {
    text: string;
    background: string | null;
    referencePoint: tsvector.Vector;
    shift: tsvector.Vector;
    alignment: CanvasTextAlign;
    valignment: CanvasTextBaseline = "alphabetic";

    constructor(
        text: string,
        frame: frame.Frame, 
        point: tsvector.Vector,
        shift: tsvector.Vector = [0, 0],
        alignment: CanvasTextAlign = "left",
        background: string | null = null
    ) {
        const dummyoffset = [0, 0];
        // call super with dummy arguments for now.
        super(frame, point, null, dummyoffset, false);
        this.text = text;
        this.background = background;
        this.referencePoint = point;
        this.alignment = alignment;
        this.shift = shift;
    };
    // use the reference point for get/set operations
    getFramePoint(): tsvector.Vector {
        return this.referencePoint;
    };
    setFramePoint(position: tsvector.Vector): void {
        this.referencePoint = position;
    };
    // setters
    valigned(valignment: CanvasTextBaseline): TextBox {
        this.valignment = valignment;
        this.requestRedraw();
        return this;
    };
    setText(text: string): TextBox {
        this.text = text;
        this.requestRedraw();
        return this;
    };
    setShift(shift: tsvector.Vector): TextBox {
        this.shift = shift;
        this.requestRedraw();
        return this;
    };
    aligned(alignment: CanvasTextAlign): TextBox {
        this.alignment = alignment;
        this.requestRedraw();
        return this;
    };
    boxed(background: string | null): TextBox {
        this.background = background;
        this.requestRedraw();
        return this;
    }
    // override draw to draw the text box
    draw() {
        if (!this.isLive()) {
            return;
        }
        const frame = this.onFrame!;
        const ctx = frame.diagram.ctx!;
        const prep = this.prepare();
        // for stats, always compute the background path
        const bgPath = this.drawPath();
        // set text alignment
        ctx.textAlign = this.alignment;
        ctx.textBaseline = this.valignment;
        // set the font if specified
        if (this.textFont) {
            ctx.font = this.textFont;
        }
        // draw background if specified
        if (this.background) {
            //const bgPath = this.drawPath();
            ctx.fillStyle = this.background;
            ctx.fill(bgPath);
        }
        // compute the pixel position
        const shiftedPoint = tsvector.vAdd(this.referencePoint, this.shift);
        const pixelPos = this.onFrame!.toPixel(shiftedPoint);
        const canvasPos = this.onFrame!.diagram.toCanvas(pixelPos);
        const [x, y] = canvasPos;
        // apply the rotation to the context
        const rotation = new conveniences.Rotation2d(-this.rotationDegrees, canvasPos);
        rotation.applyToCanvas(ctx);
        // draw the text at the position
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, x, y);
        ctx.restore(); // undo the prepare() save
    };
    // compute path for background rectangle
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("TextBox is not attached to a frame.");
        }
        const {offset, size} = this.getSize();
        // set up parameters for drawPath
        this.point = tsvector.vAdd(this.referencePoint, this.shift);
        this.size = size;
        this.offset = offset;
        this.scaled = false; // always unscaled
        return super.drawPath();
    };
    // get the size of the text box in pixels and the offset of the lower left corner
    getSize(): {offset: tsvector.Vector, size: tsvector.Vector} {
        if (!this.isLive()) {
            throw new Error("TextBox is not attached to a frame.");
        }
        const ctx = this.onFrame!.diagram!.ctx!;
        // set the font if specified
        if (this.textFont) {
            // save the state
            ctx.save();
            ctx.font = this.textFont;
        }
        const m = ctx.measureText(this.text);
        // restore the state
        if (this.textFont) {
            ctx.restore();
        }
        const textWidth = m.width;
        const textHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        // xxxx add some padding. (hardcoded for now)
        const heightrescale = 1.5;
        const textHeightPadded = textHeight * heightrescale;
        const size: tsvector.Vector = [textWidth, textHeightPadded];
        let offsety = -m.actualBoundingBoxDescent;
        let offsetx = -m.actualBoundingBoxLeft;
        if (this.alignment === "center") {
            offsetx = offsetx - textWidth / 2;
        } else if (this.alignment === "right") {
            offsetx = offsetx - textWidth;
        }
        // baseline adjustments
        if (this.valignment === "top") {
            offsety = offsety - textHeight;
        } else if (this.valignment === "middle") {
            offsety = offsety - textHeight / 2;
        } else if (this.valignment === "alphabetic") {
            // default, do nothing
        } else if (this.valignment === "ideographic") {
            // treat as alphabetic
        } else if (this.valignment === "bottom") {
            // do nothing extra
        }
        const offset: tsvector.Vector = [offsetx, offsety];
        return {offset, size};
    };
}