
import * as tsvector from 'tsvector';

var globalCounter = 0;

export abstract class Styled {
    objectName: string;
    color: string = "black";
    lineWidth: number = 1;
    lineDash: tsvector.Vector | null = null;
    stroke: boolean = false;
    constructor() {
        const constructorName = this.constructor.name;
        this.objectName = constructorName + globalCounter;
        globalCounter += 1;
    };
    abstract draw(): void;
    stroked() {
        this.stroke = true;
        return this;
    };
    filled() {
        this.stroke = false;
        return this;
    };
    colored(color: string) {
        this.color = color;
        return this;
    };
    linedWidth(width: number) {
        this.lineWidth = width;
        return this;
    };
    dashed(dash: tsvector.Vector | null) {
        this.lineDash = dash;
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
    };
}