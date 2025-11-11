
import * as tsvector from 'tsvector';
import * as frame from './frame';

/** Draw on an HTML element.  Return a frame for the diagram. */
export function drawOn(container: HTMLElement, width: number, height: number): frame.Frame {
    const diag = new Diagram(container, width, height);
    return diag.mainFrame;
};

/**
 * A diagram is a canvas with a frame.
 * It can be used to draw shapes, lines, and images.
 * The diagram is the main entry point for drawing.
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
    autoRedraw: boolean = true;
    watchedEvents: Set<string> = new Set<string>();

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
        this.canvas.style.border = "1px solid black"; // Optional: Add border
        // empty the container and add the canvas
        this.container.innerHTML = "";
        this.container.appendChild(this.canvas);
        // Get the context
        this.ctx = this.canvas.getContext("2d");
        this.stats = new CanvasStats();
        this.last_stats = this.stats;
        this.mainFrame = new frame.Frame(this, null, null);
    };
    /** Event handler for any mouse event */
    mouseEventHandler(event: MouseEvent) {
        // Convert the mouse event to canvas coordinates
        //debugger;
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
    /** handle an event of a given type */
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
    /** set image smoothing */
    smoothImages(smooth: boolean=true) {
        if (this.ctx === null) {
            return;
        }
        this.ctx.imageSmoothingEnabled = smooth;
        return this;
    };
    /** Make an image usable in a diagram by name. */
    nameImage(name: string, image: HTMLImageElement) {
        this.nameToImage.set(name, image);
        return this;
    };
    /** Get a named image from the diagram. */
    getNamedImage(name: string): HTMLImageElement | null {
        const image = this.nameToImage.get(name);
        if (image === undefined) {
            return null;
        }
        return image;
    }
    /** Make an image from a URL usable in a diagram by name. */
    nameImageFromURL(name: string, url: string) {
        const image = new Image();
        image.src = url;
        this.nameImage(name, image);
    };
    /** Convert cartesian xy to canvas xy (with y inverted) */
    toCanvas(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        //console.log(`toCanvas: ${xy} -> ${result}`);
        return result;
    };
    /** Convert canvas xy to cartesian xy (with y inverted) */
    toCartesian(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        //console.log(`toCartesian: ${xy} -> ${result}`);
        return result;
    };
    draw() {
        this.mainFrame.prepareForRedraw();
        this.mainFrame.draw();
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
                    this.clear();
                    this.draw();
                } finally {  
                    this.redraw_requested = false;
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
        this.stats = new CanvasStats();
    };
    /** record a cartesian xy point */
    addPoint(xy: tsvector.Vector) {
        this.stats.addPoint(xy);
    };
    addxy(x: number, y: number) {
        this.stats.addxy(x, y);
    };
    // get pixels from the canvas
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
    // get the rgba values from a pixel on the canvas
    getPixelData(canvasXY: tsvector.Vector): tsvector.Vector {
        const [x, y] = canvasXY;
        const toCanvasXY = tsvector.vAdd(canvasXY, [1, 1]);
        const imageData = this.getImageData(canvasXY, toCanvasXY);
        const index = 0;
        return Array.from(imageData.data.slice(index, index + 4));
    };
    // use the stats to fit the diagram to the points
    fit(border: number = 0) {
        //debugger;
        if (this.stats.minxy === null || this.stats.maxxy === null) {
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
    }
}