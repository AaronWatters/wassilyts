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
    drawPath(): Path2D {
        const path = new Path2D();
        const center = this.center;
        let radius = this.radius;
        const pixelCenter = this.onFrame.toPixel(center);
        if (this.scaled) {
            const offset = [center[0] + radius, center[1]];
            const pixelOffset = this.onFrame.toPixel(offset);
            const pixelRadius = tsvector.vLength(tsvector.vSub(pixelCenter, pixelOffset));
            radius = pixelRadius;
        }
        const [px, py] = pixelCenter;
        path.arc(px, py, radius, 0, 2 * Math.PI);
        return path;
    };
}