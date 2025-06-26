
import * as tsvector from 'tsvector';
import * as frame from './frame';

var globalCounter = 0;

/**
 * Base class for styled objects drawn on a canvas.
 */
export abstract class Styled {
    objectName: string;
    onFrame: frame.Frame | null = null; // the frame which contains this object

    color: string = "black";
    lineWidth: number = 1;
    lineDash: tsvector.Vector | null = null;
    stroke: boolean = false;
    textFont: string | null = null; // font for text, null means use default

    defunct: boolean = false; // true if the object is no longer used
    responsive: boolean = true; // true if the object should respond to events
    eventTypeToHandler: Map<string, frame.frameEventHandler> = new Map();

    constructor() {
        const constructorName = this.constructor.name;
        this.objectName = constructorName + globalCounter;
        globalCounter += 1;
    };

    /** Draw the object on the canvas. */
    abstract draw(): void;

    /** Get the reference point of the object in cartesian pixel coordinates. */
    abstract getPixel(): tsvector.Vector;

    /** Set the reference point of the object in cartesian pixel coordinates. */
    abstract setPixel(position: tsvector.Vector): void;

    isLive(): boolean {
        if (!this.onFrame) {
            throw new Error("Marking is not attached to a frame.");
        }
        return !this.defunct;
    };
    watchEvent(eventType: string) {
        // add an event handler for the marking
        if (!this.onFrame) {
            throw new Error("Marking is not attached to a frame.");
        }
        this.onFrame.watchEvent(eventType);
    };
    requestRedraw() {
        // request a redraw of the frame
        if (!this.isLive()) {
            return;
        }
        this.onFrame!.requestRedraw();
    };
    /** rename the element in the containing frame */
    rename(newname: string): void {
        if (!this.onFrame) {
            this.objectName = newname;
            return; // no frame to rename in, just change the name
        }
        this.onFrame.renameElement(this, newname);
    };
    /**
     * Determine if the object is picked by a mouse event.
     * @param canvasXY 
     * @returns boolean
     */
    pickObject(canvasXY: tsvector.Vector): boolean {
        // default pickObject returns true if the object is not defunct and responsive
        return this.responsive && !this.defunct;
    };
    // default event handler
    mouseEventHandler(eventType: string, canvasXY: tsvector.Vector, cartesianXY: tsvector.Vector, frameXY: tsvector.Vector): boolean {
        // If the object is not responsive, do nothing
        if (!this.responsive) {
            return false;
        }
        // Is there a handler for this event type?
        const handler = this.eventTypeToHandler.get(eventType);
        if (handler) {
            // Is the object not defunct and picked?
            if (!this.defunct && this.pickObject(canvasXY)) {
                // Call the handler with the event type and coordinates
                return handler(this, eventType, canvasXY, cartesianXY, frameXY);
            }
        }
        // If no handler or not picked, return false
        return false;   
    };
    // set an event handler for a specific event type
    onEvent(eventType: string, handler: frame.frameEventHandler | null): Styled {
        this.watchEvent(eventType);
        // Store the handler in the map
        if (handler === null) {
            // If the handler is null, remove the event type from the map
            this.eventTypeToHandler.delete(eventType);
        } else {
            this.eventTypeToHandler.set(eventType, handler);
        }
        // Return the styled object for chaining
        return this;
    };
    // set a "final" event handler which always returns true and does not recieve the this object (for external serialization))
    handleEvent(eventType: string, handler: frame.externalEventHandler | null): Styled {
        // Convert the external handler to a frame event handler
        if (handler === null) {
            this.eventTypeToHandler.delete(eventType);
        } else {
            const internalHandler: frame.frameEventHandler = (
                element: Styled | null,
                eventType: string,
                canvasXY: tsvector.Vector,
                cartesianXY: tsvector.Vector,
                frameXY: tsvector.Vector
            ) => {
                // Call the external handler with the event type and coordinates
                let name = null;
                if (element !== null) {
                    name = element.objectName;
                }
                handler(name, eventType, canvasXY, cartesianXY, frameXY);
                // Always return true to indicate the event was handled
                return true;
            }
            this.onEvent(eventType, internalHandler);
        }
        // Return the styled object for chaining
        return this;
    };
    syncToParent() {
        // do nothing by default
    };
    font(font: string | null) {
        // set the font for text, null means use default
        this.textFont = font;
        this.requestRedraw();
        return this;
    };
    stroked() {
        this.stroke = true;
        this.requestRedraw();
        return this;
    };
    filled() {
        this.stroke = false;
        this.requestRedraw();
        return this;
    };
    colored(color: string) {
        this.color = color;
        this.requestRedraw();
        return this;
    };
    linedWidth(width: number) {
        this.lineWidth = width;
        this.requestRedraw();
        return this;
    };
    dashed(dash: tsvector.Vector | null) {
        this.lineDash = dash;
        this.requestRedraw();
        return this;
    };
    applyStyle(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        if (this.lineWidth) {
            ctx.lineWidth = this.lineWidth;
        }
        if (this.lineDash) {
            ctx.setLineDash(this.lineDash);
        }
        if (this.textFont) {
            ctx.font = this.textFont;
        } 
    };
    forget() {
        this.defunct = true;
        this.requestRedraw();
        // bookkeeping elsewhere should remove this object.
    }
}