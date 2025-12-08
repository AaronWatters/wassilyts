
import * as tsvector from 'tsvector';
import * as frame from './frame';

var globalCounter = 0;

/**
 * Base class for styled objects drawn on a canvas.
 * Styled objects have properties such as color, line width, and font,
 * and can respond to events.
 * 
 * @abstract
 * @class Styled
 * @param {frame.Frame | null} onFrame - The frame which contains this object.
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

    constructor(onFrame: frame.Frame | null = null) {
        this.objectName = this.freshName();
        this.onFrame = onFrame;
        if (onFrame) {
            // inherit the style from the frame
            this.styleLike(onFrame);
        }
    };

    /**
     * Create a fresh unique name in this context by appending a global counter to the prefix.
     * @param prefix prefix for new name. If null, use the class name.
     * @returns A fresh unique name string.
     */
    freshName(prefix: string | null = null): string {
        const base = prefix ? prefix : this.constructor.name;
        const name = base + globalCounter;
        globalCounter += 1;
        return name;
    };

    /** Apply the style of another Styled object to this one.
     * @param other The other Styled object to copy the style from.
     */
    styleLike(other: Styled) {
        this.color = other.color;
        this.lineWidth = other.lineWidth;
        this.lineDash = other.lineDash;
        this.textFont = other.textFont;
        this.stroke = other.stroke;
        this.responsive = other.responsive;
    };

    /** Draw the object on the canvas. */
    abstract draw(): void;

    /** Get the reference point of the object in cartesian pixel coordinates.
     * @return The reference point in pixel coordinates.
    */
    abstract getPixel(): tsvector.Vector;

    /** Set the reference point of the object in cartesian pixel coordinates.
     * @param position The new reference point in pixel coordinates.
    */
    abstract setPixel(position: tsvector.Vector): void;

    /** Determine if the object is attached to a live frame.
     * @return True if the object is live, false otherwise.
     * @internal
     */
    isLive(): boolean {
        if (!this.onFrame) {
            throw new Error("Marking is not attached to a frame.");
        }
        return !this.defunct;
    };
    /** Watch for a specific event type on the containing frame.
     * @param eventType The string name of event to watch for.
     * @internal
     */
    watchEvent(eventType: string) {
        // add an event handler for the marking
        if (!this.onFrame) {
            throw new Error("Marking is not attached to a frame.");
        }
        this.onFrame.watchEvent(eventType);
    };
    /** Request a redraw of the frame containing this object. */
    requestRedraw() {
        if (!this.isLive()) {
            return;
        }
        this.onFrame!.requestRedraw();
    };
    /** Rename this element in the containing frame,
     * @param newname The new name for this object.
     */
    rename(newname: string): void {
        if (!this.onFrame) {
            this.objectName = newname;
            return; // no frame to rename in, just change the name
        }
        this.onFrame.renameElement(this, newname);
    };
    /**
     * Determine if the object is picked by a mouse event.
     * @param canvasXY the canvas coordinates of the mouse event.
     * @returns True if the object is picked, false otherwise.
     */
    pickObject(canvasXY: tsvector.Vector): boolean {
        // default pickObject returns true if the object is not defunct and responsive
        return this.responsive && !this.defunct;
    };
    /** Default mouse event handler.
     * @internal
     * @param eventType The type of mouse event.
     * @param canvasXY The canvas coordinates of the mouse event.
     * @param cartesianXY The cartesian pixel coordinates of the mouse event.
     * @param frameXY The frame model coordinates of the mouse event.
     * @returns True if the event was handled, false otherwise.
     */
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
    /** Set an event handler for a specific event type
     * @param eventType The string name of the event.
     * @param handler The event handler function or null to remove.
     * @returns The styled object for chaining.
     */
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
    /** Set a "final" event handler which always returns true and does not recieve the this object (for external serialization))
     * @param eventType The string name of the event.
     * @param handler The external event handler function or null to remove.
     * @returns The styled object for chaining.
     */
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
    /** Prepare the object for redraw.
     * @internal
     */
    prepareForRedraw() {
        // do nothing by default
    };
    /** Set the font for text, null means use default.
     * @param font The font string to set.
     * @returns The styled object for chaining.
     */
    font(font: string | null) {
        this.textFont = font;
        this.requestRedraw();
        return this;
    };
    /** Set the object to be stroked when drawn.
     * @returns The styled object for chaining.
     */
    stroked() {
        this.stroke = true;
        this.requestRedraw();
        return this;
    };
    /** Set the object to be filled when drawn.
     * @returns The styled object for chaining.
     */
    filled() {
        this.stroke = false;
        this.requestRedraw();
        return this;
    };
    /** Set the color for the object.
     * @param color The color string to set.
     * @returns The styled object for chaining.
     */
    colored(color: string) {
        this.color = color;
        this.requestRedraw();
        return this;
    };
    /** Set the line width for the object.
     * @param width The line width to set.
     * @returns The styled object for chaining.
     */
    linedWidth(width: number) {
        this.lineWidth = width;
        this.requestRedraw();
        return this;
    };
    /** Set the line dash pattern for the object.
     * @param dash The line dash pattern to set, or null for solid line.
     * @returns The styled object for chaining.
     */
    dashed(dash: tsvector.Vector | null) {
        this.lineDash = dash;
        this.requestRedraw();
        return this;
    };
    /** Apply the style to a canvas rendering context.
     * @internal
     * @param ctx The canvas rendering context to apply the style to.
     */
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
    /** Forget this object from the containing frame and diagram. */
    forget() {
        this.defunct = true;
        this.requestRedraw();
        // bookkeeping during redraw should remove this object from external structures.
    }
}