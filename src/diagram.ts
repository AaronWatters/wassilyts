
import * as tsvector from 'tsvector';
import * as frame from './frame';
import * as styled from './styled';

/** Draw on an HTML element.  Return a frame for the diagram. */
export function drawOn(container: HTMLElement, width: number, height: number): frame.Frame {
    const diag = new Diagram(container, width, height);
    return diag.mainFrame;
};

/**
 * A diagram is a canvas with a frame.
 * It can be used to draw shapes, lines, and images.
 * The diagram is the main entry point for drawing
 * and managing the canvas but the user typically interacts
 * with the diagram through its main frame or a subframe.
 * 
 * @param domObject The HTML container element for the diagram.
 * @param width The width of the diagram in pixels.
 * @param height The height of the diagram in pixels.
 */
export class Diagram {

    // The container for the canvas
    container: HTMLElement;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    // Record of coordinate extremes in cartesian coordinates
    stats: CanvasStats;
    last_stats: CanvasStats | null = null;
    // The primary frame for the diagram
    mainFrame: frame.Frame;
    nameToImage: Map<string, HTMLImageElement>;
    redraw_requested: boolean = false;
    deferred_fit_border: number | null = null;
    autoRedraw: boolean = true;
    watchedEvents: Set<string> = new Set<string>();
    // for external named access, keep track of named styled elements
    nameToStyled: Map<string, styled.Styled> = new Map<string, styled.Styled>();

    constructor(domObject: HTMLElement, width: number, height: number) {
        //.log(`Diagram: creating a new diagram with width ${width} and height ${height}`);
        this.container = domObject;
        this.width = width;
        this.height = height;
        this.nameToImage = new Map<string, HTMLImageElement>();
        // Create and configure canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.border = "1px solid black"; // Optional: Add border (should be customizable)
        // empty the container and add the canvas
        this.container.innerHTML = "";
        this.container.appendChild(this.canvas);
        // Get the context
        this.ctx = this.canvas.getContext("2d");
        this.stats = new CanvasStats();
        this.last_stats = this.stats;
        this.mainFrame = new frame.Frame(this, null, null);
    };
    /** Get a styled object associated with the diagram by name.
     * @param name The name of the styled object.
     * @returns The styled object or null if not found.
    */
    getStyledByName(name: string): styled.Styled | null {
        const styled = this.nameToStyled.get(name);
        if (styled === undefined) {
            return null;
        }
        return styled;
    };
    /** Add a styled object to the diagram's name registry.
     * @param styled The styled object to add
     * @internal
    */
    addStyled(styled: styled.Styled) {
        const n2s = this.nameToStyled;
        // prevent name clashes
        const existing = n2s.get(styled.objectName);
        if (existing !== undefined) {
            if (existing === styled) {
                // already added
                return;
            }
            throw new Error(`Styled object name ${styled.objectName} already exists in diagram.`);
        }
        n2s.set(styled.objectName, styled);
    };
    /** Delete a styled object from the diagram's name registry.
     * @param styled The styled object to delete
     * @internal
    */
    deleteStyled(styled: styled.Styled) {
        const n2s = this.nameToStyled;
        if (n2s.has(styled.objectName)) {
            n2s.delete(styled.objectName);
        }
    };
    /** Event handler for any mouse event 
     * @param event The mouse event to handle.
     * @internal
    */
    mouseEventHandler(event: MouseEvent) {
        // Convert the mouse event to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const canvasXY = [x, y];
        // Convert to cartesian coordinates
        const cartesianXY = this.toCartesian(canvasXY);
        // Add the point to the stats
        //this.addPoint(cartesianXY);
        // Call the frame's mouse event handler
        this.mainFrame.frameEventHandler(event, canvasXY, cartesianXY);
    };
    /** handle an event of a given type 
     * @param eventType The type of the event to watch.
     * @returns The diagram for chaining.
     * @internal
    */
    watchEvent(eventType: string) {
        //cl(this, `Diagram: watching event type ${eventType}`);
        // If the event type is already watched, do nothing
        if (this.watchedEvents.has(eventType)) {
            return this;
        }
        if (this.ctx === null) {
            throw new Error("Canvas context is not available.");
        }
        // Add the event listener to the canvas
        //this.canvas.addEventListener(eventType, (event: MouseEvent) => {
        //    this.mouseEventHandler(event);
        //});
        this.canvas.addEventListener(eventType, (event: Event): void => {
            // Call the mouse event handler
            this.mouseEventHandler(event as MouseEvent);
        });
        // Return the diagram for chaining
        return this;
    };
    /** set image smoothing.
     * @param smooth - true to enable smoothing, false to disable.
     * @returns The diagram for chaining.
    */
    smoothImages(smooth: boolean=true) {
        if (this.ctx === null) {
            return;
        }
        this.ctx.imageSmoothingEnabled = smooth;
        return this;
    };
    /** Make an image usable in a diagram by name. 
     * @param name The name to assign to the image.
     * @param image The HTMLImageElement to name.
     * @returns The diagram for chaining.
    */
    nameImage(name: string, image: HTMLImageElement) {
        this.nameToImage.set(name, image);
        return this;
    };
    /** Get a named image from the diagram. 
     * @param name The name of the image.
     * @returns The HTMLImageElement or null if not found.
    */
    getNamedImage(name: string): HTMLImageElement | null {
        const image = this.nameToImage.get(name);
        if (image === undefined) {
            return null;
        }
        return image;
    }
    /** Make an image from a URL usable in a diagram by name. 
     * @param name The name to assign to the image.
     * @param url The URL of the image.
     * @param replace Whether to replace an existing image with the same name (default: true).
     * @returns The diagram for chaining.
    */
    nameImageFromURL(name: string, url: string, replace: boolean = true) {
        if (!replace) {
            const existing = this.nameToImage.get(name);
            if (existing !== undefined) {
                // do not replace existing image
                return this;
            }
        }
        const image = new Image();
        image.src = url;
        this.nameImage(name, image);
    };
    /** Convert cartesian xy to canvas xy (with y inverted) 
     * @internal
     * @param xy The cartesian coordinates to convert.
     * @returns The corresponding canvas coordinates.
    */
    toCanvas(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        //console.log(`toCanvas: ${xy} -> ${result}`);
        return result;
    };
    /** Convert canvas xy to cartesian xy (with y inverted) 
     * @internal
     * @param xy The canvas coordinates to convert.
     * @returns The corresponding cartesian coordinates.
    */
    toCartesian(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        //console.log(`toCartesian: ${xy} -> ${result}`);
        return result;
    };
    /** Draw the diagram */
    draw() {
        this.clear();
        this.mainFrame.prepareForRedraw();
        this.mainFrame.draw();
        // if there is a deferred fit, do it now
        if (this.deferred_fit_border !== null) {
            const border = this.deferred_fit_border;
            this.fit(border);
            this.deferred_fit_border = null;
            this.requestRedraw()
        }
    };
    /** Request a redraw of the diagram */
    requestRedraw() {
        if (!this.redraw_requested) {
            this.redraw_requested = true;
            if (!this.autoRedraw) {
                // if not auto redrawing, just return
                return;
            }
            requestAnimationFrame(() => {
                try {
                    // note: in case of fit draw may request another redraw
                    this.redraw_requested = false;
                    this.draw();
                } finally {  
                    //this.redraw_requested = false;
                }
            });
        }
    };
    /** Set the auto redraw flag */
    resumeRedraw() {
        if (this.autoRedraw) {
            // already auto redrawing
            return;
        }
        this.autoRedraw = true;
        if (this.redraw_requested) {
            // force a redraw
            this.redraw_requested = false;
            this.requestRedraw();
        }
    };
    /** Pause the auto redraw (in cases of large diagram updates) */
    pauseRedraw() {
        this.autoRedraw = false;
    }
    /** Clear the canvas and reset stats */
    clear() {
        this.ctx!.clearRect(0, 0, this.width, this.height);
        this.last_stats = this.stats;
        this.resetStats();
    };
    /** Reset the drawing statistics 
     * @internal
    */
    resetStats() {
        this.stats = new CanvasStats();
    };
    /** record a cartesian xy point 
     * @internal
     * @param xy The cartesian coordinates of the point.
    */
    addPoint(xy: tsvector.Vector) {
        this.stats.addPoint(xy);
    };
    addxy(x: number, y: number) {
        this.stats.addxy(x, y);
    };
    /** get pixels from the canvas
     * @param fromCanvasXY The top-left canvas coordinates of the region to get. If null, it will be [0, 0].
     * @param toCanvasXY The bottom-right canvas coordinates of the region to get.
     * If null, it will be [width, height].
     * @returns The ImageData object for the region.
     */
    getImageData(fromCanvasXY: tsvector.Vector | null, toCanvasXY: tsvector.Vector | null): ImageData {
        if (fromCanvasXY === null) {
            fromCanvasXY = [0, 0];
        }
        const [x, y] = fromCanvasXY;
        if (toCanvasXY === null) {
            toCanvasXY = [this.width, this.height];
        }
        const [width, height] = tsvector.vSub(toCanvasXY, fromCanvasXY);
        return this.ctx!.getImageData(x, y, width, height);
    };
    /** Get the rgba values from a pixel on the canvas primarily for testing.
    * @param canvasXY The canvas coordinates of the pixel.
    * @returns The rgba values as an array of four numbers.
    */
    getPixelData(canvasXY: tsvector.Vector): tsvector.Vector {
        const [x, y] = canvasXY;
        const toCanvasXY = tsvector.vAdd(canvasXY, [1, 1]);
        const imageData = this.getImageData(canvasXY, toCanvasXY);
        const index = 0;
        return Array.from(imageData.data.slice(index, index + 4));
    };
    /** Use the draw statistics to fit the diagram to the visible points 
    * @param border The border to add around the fitted region in cartesian coordinates.
    */
    fit(border: number = 0) {
        if (this.stats.minxy === null || this.stats.maxxy === null) {
            this.deferred_fit_border = border;
            return;
        };
        const expander = [border, border];
        const minxy = tsvector.vSub(this.stats.minxy, expander);
        const maxxy = tsvector.vAdd(this.stats.maxxy, expander);
        const width = this.width;
        const height = this.height;
        const diff = tsvector.vSub(maxxy, minxy);
        //const expandedDiff = tsvector.vAdd(diff, [border, border]);
        const [dw, dh] = diff;
        if (dw === 0 || dh === 0) {
            return;
        }
        const aspect = dh / dw;
        const myAspect = height / width;
        //console.log(`aspect: ${aspect}, myAspect: ${myAspect}`);
        let fromMinX = 0;
        let fromMaxX = width;
        let fromMinY = 0;
        let fromMaxY = height;
        if (aspect > myAspect) {
            //console.log('The region is taller than the diagram, center the width and expand the height');
            const ddw = height / aspect;
            //console.log(`newWidth: ${ddw}; old width: ${width}`);
            fromMinX = (width - ddw) / 2;
            fromMaxX = fromMinX + ddw;
        } else {
            //console.log('The region is wider than the diagram, center the height and expand the width');
            const ddh = width * aspect;
            fromMinY = (height - ddh) / 2;
            fromMaxY = fromMinY + ddh;
        }
        //console.log(`fromMinX: ${fromMinX}, fromMaxX: ${fromMaxX}, fromMinY: ${fromMinY}, fromMaxY: ${fromMaxY}`);
        const fromMinXY = [fromMinX, fromMinY];
        const fromMaxXY = [fromMaxX, fromMaxY];
        const affine = frame.regionMap(minxy, maxxy, fromMinXY, fromMaxXY);
        //console.log(`affine:`, affine);
        const mainFrame = this.mainFrame;
        const currentAffine = mainFrame.ModelToPixel!;
        //console.log(`currentAffine:`, currentAffine);
        const adjustedAffine = tsvector.MMProduct(affine, currentAffine);
        //console.log(`adjustedAffine:`, adjustedAffine);
        const pixelToModel = tsvector.MInverse(adjustedAffine);
        mainFrame.setAffine(pixelToModel);
    };
};

/**
 * A class to collect statistics about the canvas.
 * It keeps track of the minimum and maximum x and y coordinates
 * that have been added to it.
 * This can be used to fit the canvas to the points added.
 * 
 * @internal
 */
export class CanvasStats {
    minxy: tsvector.Vector | null;
    maxxy: tsvector.Vector | null;
            
    constructor() {
        this.minxy = null;
        this.maxxy = null;
    };
    addxy(x: number, y: number) {
        if (isNaN(x) || isNaN(y)) {
            throw new Error("Cannot add NaN values to stats");
        };
        this.addPoint([x, y]);
    };
    addPoint(point: tsvector.Vector) {
        if (this.minxy === null) {
            this.minxy = point;
            this.maxxy = point;
        } else {
            this.minxy = tsvector.vMin(this.minxy, point);
            this.maxxy = tsvector.vMax(this.maxxy!, point);
        }
    };
    overlaps(other: CanvasStats) {
        if (this.minxy === null || this.maxxy === null) {
            return false;
        }
        if (other.minxy === null || other.maxxy === null) {
            return false;
        }
        const overlapMax = tsvector.vMin(this.maxxy, other.maxxy!);
        const overlapMin = tsvector.vMax(this.minxy, other.minxy!);
        const diff = tsvector.vSub(overlapMax, overlapMin);
        return Math.min(...diff) > 0;
    };
}