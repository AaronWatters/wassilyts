

import * as marking from "./marking";
import * as frame from "./frame";
import * as tsvector from "tsvector";

export abstract class Assembly extends marking.Marking {
    // the dedicated frame for drawing this assembly.
    assemblyFrame: frame.Frame;
    // reference point
    framePoint: tsvector.Vector = [0, 0];
    constructor(onFrame: frame.Frame) {
        super(onFrame);
        this.assemblyFrame = new frame.Frame(onFrame.diagram, null, onFrame);
        this.setTranslation(this.framePoint);
        onFrame.addElement(this.assemblyFrame);
    };
    // Method to assemble the marking.  Draw relative to this.framePoint.
    abstract assemble(onFrame: frame.Frame): void;
    // The prepare operation makes the assembly
    prepareForRedraw(): void {
        const assemblyFrame = this.assemblyFrame;
        assemblyFrame.clear();
        assemblyFrame.styleLike(this);
        this.assemble(assemblyFrame);
    };
    setTranslation(position: tsvector.Vector): void {
        this.framePoint = position;
        const reverse = tsvector.vScale(-1, position);
        const translationMatrix = frame.translateScaleMatrix(reverse, null);
        this.assemblyFrame.setAffine(translationMatrix);
    };
    setFramePoint(position: tsvector.Vector): void {
        this.setTranslation(position);
        this.requestRedraw();
    };
    getFramePoint(): tsvector.Vector {
        return this.framePoint;
    };
    pickObject(canvasXY: tsvector.Vector): boolean {
        const picked = this.assemblyFrame.pickedMarkings(canvasXY);
        if (picked.length > 0) {
            return true;
        } else {
            return false;
        }
    };
    drawPath(): Path2D {
        // assemblies do not have a path
        return new Path2D();
    };
    draw(): void {
        // do nothing, assembly is drawn via its frame
    };
};

export class Star extends Assembly {
    center: tsvector.Vector = [0, 0];
    numPoints: number;
    innerRadius: number;
    outerRadius: number;
    rotationDegrees: number;
    constructor(
        onFrame: frame.Frame,
        center: tsvector.Vector,
        innerRadius: number,
        numPoints: number = 5,
        pointFactor: number = 1.4,
        degrees: number = 0,
    ) {
        super(onFrame);
        this.numPoints = numPoints;
        this.innerRadius = innerRadius;
        this.outerRadius = innerRadius * pointFactor;
        this.rotationDegrees = degrees;
        this.setTranslation(center);
    };
    assemble(onFrame: frame.Frame): void {
        const center = [0, 0];
        const radiansPerPoint = (2 * Math.PI) / (this.numPoints * 2);
        const points = [];
        const rotationRadians = (this.rotationDegrees * Math.PI) / 180;
        for (let i = 0; i < this.numPoints * 2; i++) {
            const radius = (i % 2 === 0) ? this.outerRadius : this.innerRadius;
            const angle = i * radiansPerPoint + rotationRadians;
            const x = center[0] + radius * Math.cos(angle);
            const y = center[1] + radius * Math.sin(angle);
            points.push([x, y]);
        }
        const poly = onFrame.polygon(points);
        poly.closed(true);
        poly.styleLike(this);
        poly.filled();
    };
};