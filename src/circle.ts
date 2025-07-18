import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as marking from './marking';

export class Circle extends marking.Marking {
    center: tsvector.Vector;
    radius: number;
    scaled: boolean;
    constructor(frame: frame.Frame, center: tsvector.Vector, radius: number, scaled: boolean = true) {
        super(frame);
        this.center = center;
        this.radius = radius;
        this.scaled = scaled;
    };
    centerAt(position: tsvector.Vector): Circle {
        // set the center of the circle in frame coordinates
        this.center = position;
        this.requestRedraw();
        return this;
    };
    resize(radius: number): Circle {
        // set the radius of the circle
        this.radius = radius;
        this.requestRedraw();
        return this;
    };
    scaling(scaled: boolean): Circle {
        // set whether the circle is scaled or not
        this.scaled = scaled;
        this.requestRedraw();
        return this;
    }
    setFramePoint(position: tsvector.Vector): void {
        // set the center of the circle in frame coordinates
        this.center = position;
        //this.requestRedraw();
    };
    getFramePoint(): tsvector.Vector {
        // get the center of the circle in frame coordinates
        return this.center;
    };
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Circle is not attached to a frame.");
        }
        const frame = this.onFrame!;
        const path = new Path2D();
        const center = this.center;
        let radius = this.radius;
        const pixelCenter = frame.addPoint(center);
        const ccenter = frame.diagram.toCartesian(pixelCenter);
        if (this.scaled) {
            const offset = [center[0] + radius, center[1]];
            const pixelOffset = frame.addPoint(offset);
            const pixelRadius = tsvector.vLength(tsvector.vSub(pixelCenter, pixelOffset));
            radius = pixelRadius;
        }
        const [px, py] = pixelCenter;
        //console.log(`translated circle at ${center} with radius ${this.radius}`);
        //console.log(`to circle at ${px}, ${py} with radius ${radius}`);
        path.arc(px, py, radius, 0, 2 * Math.PI);
        // add reference points to diagram
        frame.addPixelPoint(tsvector.vAdd(ccenter, [radius, 0]));
        frame.addPixelPoint(tsvector.vAdd(ccenter, [0, radius]));
        frame.addPixelPoint(tsvector.vAdd(ccenter, [-radius, 0]));
        frame.addPixelPoint(tsvector.vAdd(ccenter, [0, -radius]));
        return path;
    };
}