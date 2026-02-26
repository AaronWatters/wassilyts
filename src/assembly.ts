

import * as marking from "./marking";
import * as frame from "./frame";
import * as tsvector from "tsvector";

// xxxx add methods to set members for subclasses...

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

export class Arrow extends Assembly {
    back: tsvector.Vector;
    tip: tsvector.Vector;
    vector: tsvector.Vector;
    tipDegrees: number = 20;
    tipLength: number | null = 10;
    tipFactor: number = 0.1; // fraction of length if tipLength is null
    constructor(
        onFrame: frame.Frame,
        back: tsvector.Vector,
        tip: tsvector.Vector,
        tipLength: number | null = null,
        tipDegrees: number = 20,
        tipFactor: number = 0.1,
    ) {
        super(onFrame);
        this.back = back;
        this.tip = tip;
        this.vector = tsvector.vSub(tip, back);
        this.tipDegrees = tipDegrees;
        this.tipLength = tipLength;
        this.tipFactor = tipFactor;
        this.setTranslation(back);
    };
    assemble(onFrame: frame.Frame, epsilon=10e-6): void {
        // geometry
        const vecLength = tsvector.vLength(this.vector);
        let tipLength = this.tipLength;
        if (vecLength < epsilon) {
            return; // no mark ???
        }
        if (tipLength === null) {
            tipLength = this.tipFactor * vecLength;
        }
        const unitVector = tsvector.vScale(1 / vecLength, this.vector);
        const perpVector = [-unitVector[1], unitVector[0]];
        const radians = (this.tipDegrees * Math.PI) / 180
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        //const tipLength = this.tipLength;
        const orthComponent = tsvector.vScale(s * tipLength, perpVector)
        const negComponent = tsvector.vScale(-c * tipLength, unitVector);
        const offsetA = tsvector.vAdd(negComponent, orthComponent)
        const tipA = tsvector.vAdd(offsetA, this.vector)
        const offsetB = tsvector.vSub(negComponent, orthComponent)
        const tipB = tsvector.vAdd(offsetB, this.vector)

        const points = [];
        points.push([0, 0]); // back point
        points.push(this.vector);  // shaft end
        // pointer...
        points.push(tipA)
        points.push(this.vector)
        points.push(tipB);
        const poly = onFrame.polygon(points);
        poly.styleLike(this);
        poly.stroked();
        poly.closed(false);
        poly.join("round")
    }
};