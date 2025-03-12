
import * as tsvector from 'tsvector';

export class Diagram {

    container: HTMLElement;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    stats: CanvasStats;

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
    };
    clear() {
        this.ctx!.clearRect(0, 0, this.width, this.height);
        this.stats = new CanvasStats();
    };
    addPoint(xy: tsvector.Vector) {
        this.stats.addPoint(xy);
    };
    addxy(x: number, y: number) {
        this.stats.addxy(x, y);
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