
import * as tsvector from 'tsvector';
import * as frame from './frame';

/** Draw on an HTML element.  Return a frame for the diagram. */
export function drawOn(container: HTMLElement, width: number, height: number): frame.Frame {
    const diag = new Diagram(container, width, height);
    return diag.mainFrame;
};

export class Diagram {

    // The container for the canvas
    container: HTMLElement;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    // Record of coordinate extremes in cartesian coordinates
    stats: CanvasStats;
    // The primary frame for the diagram
    mainFrame: frame.Frame;

    constructor(domObject: HTMLElement, width: number, height: number) {
        this.container = domObject;
        this.width = width;
        this.height = height;
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
        this.mainFrame = new frame.Frame(this, null, null);
    };
    /** Convert cartesian xy to canvas xy (with y inverted) */
    toCanvas(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        console.log(`toCanvas: ${xy} -> ${result}`);
        return result;
    };
    /** Convert canvas xy to cartesian xy (with y inverted) */
    toCartesian(xy: tsvector.Vector): tsvector.Vector {
        const result = [xy[0], this.height - xy[1]];
        console.log(`toCartesian: ${xy} -> ${result}`);
        return result;
    };
    draw() {
        this.mainFrame.draw();
    };
    clear() {
        this.ctx!.clearRect(0, 0, this.width, this.height);
        this.stats = new CanvasStats();
    };
    /** record a cartesian xy point */
    addPoint(xy: tsvector.Vector) {
        this.stats.addPoint(xy);
    };
    addxy(x: number, y: number) {
        this.stats.addxy(x, y);
    };
    // use the stats to fit the diagram to the points
    fit() {
        if (this.stats.minxy === null || this.stats.maxxy === null) {
            return;
        };
        const minxy = this.stats.minxy;
        const maxxy = this.stats.maxxy;
        const width = this.width;
        const height = this.height;
        const diff = tsvector.vSub(maxxy, minxy);
        const [dw, dh] = diff;
        if (dw === 0 || dh === 0) {
            return;
        }
        const aspect = dh / dw;
        const myAspect = height / width;
        console.log(`aspect: ${aspect}, myAspect: ${myAspect}`);
        let fromMinX = 0;
        let fromMaxX = width;
        let fromMinY = 0;
        let fromMaxY = height;
        if (aspect > myAspect) {
            console.log('The region is taller than the diagram, center the width and expand the height');
            const ddw = height / aspect;
            console.log(`newWidth: ${ddw}; old width: ${width}`);
            fromMinX = (width - ddw) / 2;
            fromMaxX = fromMinX + ddw;
        } else {
            console.log('The region is wider than the diagram, center the height and expand the width');
            const ddh = width * aspect;
            fromMinY = (height - ddh) / 2;
            fromMaxY = fromMinY + ddh;
        }
        console.log(`fromMinX: ${fromMinX}, fromMaxX: ${fromMaxX}, fromMinY: ${fromMinY}, fromMaxY: ${fromMaxY}`);
        const fromMinXY = [fromMinX, fromMinY];
        const fromMaxXY = [fromMaxX, fromMaxY];
        const affine = frame.regionMap(minxy, maxxy, fromMinXY, fromMaxXY);
        console.log(`affine:`, affine);
        const mainFrame = this.mainFrame;
        const currentAffine = mainFrame.ModelToPixel!;
        console.log(`currentAffine:`, currentAffine);
        const adjustedAffine = tsvector.MMProduct(affine, currentAffine);
        console.log(`adjustedAffine:`, adjustedAffine);
        const pixelToModel = tsvector.MInverse(adjustedAffine);
        mainFrame.setAffine(pixelToModel);
    };
};

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