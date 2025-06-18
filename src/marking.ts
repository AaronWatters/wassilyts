
import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as styled from './styled';

/**
 * A visible marking on a frame.
 */
export abstract class Marking extends styled.Styled {
    onFrame: frame.Frame;
    stroke: boolean = false;
    
    constructor(frame: frame.Frame) {
        super();
        // by default inherit the style of the frame
        this.color = frame.color;
        this.lineWidth = frame.lineWidth;
        this.lineDash = frame.lineDash;
        this.onFrame = frame;
    };
    /**
     * Draw the marking or a container for the marking.
     * The Path2D object will be used for testing pixels in mouse events.
     * If the marking doesn't override draw() then the Path2D will draw the marking.
     */
    abstract drawPath(): Path2D;
    // default draw method
    draw() {
        const path = this.drawPath();
        const prep = this.prepare();
        const ctx = this.onFrame.diagram.ctx!;
        if (this.stroke) {
            ctx.stroke(path);
        } else {
            ctx.fill(path);
        };
        ctx.restore(); // undo the prepare() save
    };
    watchEvent(eventType: string) {
        // add an event handler for the marking
        this.onFrame.watchEvent(eventType);
    };
    requestRedraw() {
        // request a redraw of the frame
        this.onFrame.requestRedraw();
    };
    /** rename the element in the containing frame */
    rename(newname: string): void {
        this.onFrame.renameElement(this, newname);
    };
    pickObject(canvasXY: tsvector.Vector): boolean {
        const path = this.drawPath();
        // test if the pixel is in the path
        const ctx = this.onFrame.diagram.ctx!;
        const result = ctx.isPointInPath(path, canvasXY[0], canvasXY[1]);
        return result;
    };
    // prepare the context for drawing, return false if no change.
    // save state if changed.
    prepare(): boolean {
        const ctx = this.onFrame.diagram.ctx!;
        ctx.save();
        this.applyStyle(ctx);
        return true;
    };
    /** Test whether pixel lies on the marking. */
    testPixel(xy: tsvector.Vector): boolean {
        const prep = this.prepare();
        const path = this.drawPath();
        const ctx = this.onFrame.diagram.ctx!;
        const result = ctx.isPointInPath(path, xy[0], xy[1]);
        ctx.restore();
        return result;
    };
};