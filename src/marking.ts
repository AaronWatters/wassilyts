
import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as styled from './styled';

/**
 * A visible marking on a frame.
 */
export abstract class Marking extends styled.Styled {
    stroke: boolean = false;
    
    /**
     * Draw the marking or a container for the marking.
     * The Path2D object will be used for testing pixels in mouse events.
     * If the marking doesn't override draw() then the Path2D will draw the marking.
     * 
     * Note: This method should not rely on context coordinate transform changes
     * so that the paths can be combined and tested for pixel hits.
     */
    abstract drawPath(): Path2D;
    // default draw method
    draw() {
        if (!this.isLive()) {
            return;
        }
        const path = this.drawPath();
        const prep = this.prepare();
        const ctx = this.onFrame!.diagram.ctx!;
        if (this.stroke) {
            ctx.stroke(path);
        } else {
            ctx.fill(path);
        };
        ctx.restore(); // undo the prepare() save
    };
    pickObject(canvasXY: tsvector.Vector): boolean {
        if (!this.isLive()) {
            return false;
        }
        const path = this.drawPath();
        // test if the pixel is in the path
        const ctx = this.onFrame!.diagram.ctx!;
        const result = ctx.isPointInPath(path, canvasXY[0], canvasXY[1]);
        return result;
    };
    // prepare the context for drawing, return false if no change.
    // save state if changed.
    prepare(): boolean {
        if (!this.isLive()) {
            return false;
        }
        const ctx = this.onFrame!.diagram.ctx!;
        ctx.save();
        this.applyStyle(ctx);
        return true;
    };
    /** Get the reference point of the marking in frame coordinates. */
    abstract getFramePoint(): tsvector.Vector;
    /** Set the reference point of the marking in frame coordinates. */
    abstract setFramePoint(position: tsvector.Vector): void;
    /** Get the reference point of the marking in cartesian pixel coordinates. */
    getPixel(): tsvector.Vector {
        if (!this.isLive()) {
            throw new Error("Marking is not attached to a frame.");
        }
        return this.onFrame!.toPixel(this.getFramePoint());
    };
    /** Set the reference point of the marking in cartesian pixel coordinates. */
    setPixel(position: tsvector.Vector): void {
        if (!this.isLive()) {
            throw new Error("Marking is not attached to a frame.");
        }
        this.setFramePoint(this.onFrame!.toModel(position));
        this.requestRedraw();
    };
};