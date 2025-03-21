import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as marking from './marking';

export class Poly extends marking.Marking {
    points: tsvector.Vector[];
    close: boolean = true;
    constructor(frame: frame.Frame, points: tsvector.Vector[]) {
        super(frame);
        this.points = points;
        this.stroked();
    };
    closed(): Poly {
        this.close = true;
        return this;
    };
    opened(): Poly {
        this.close = false;
        return this;
    };
    drawPath(): Path2D {
        const frame = this.onFrame;
        const path = new Path2D();
        const pixelPoints = this.points.map((xy) => frame.addPoint(xy));
        const [sx, sy] = pixelPoints[0];
        path.moveTo(sx, sy);
        // NOTE: could add curved options here xxxx
        pixelPoints.slice(1).forEach((xy) => {
            const [x, y] = xy;
            path.lineTo(x, y);
        });
        if (this.close) {
            path.closePath();
        }
        // add reference points to diagram
        pixelPoints.forEach((xy) => {
            frame.addPixelPoint(frame.diagram.toCartesian(xy));
        });
        return path;
    };
}