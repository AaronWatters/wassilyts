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
    vertices(points: tsvector.Vector[]): Poly {
        // set the vertices of the polygon in frame coordinates
        this.points = points;
        this.requestRedraw();
        return this;
    };
    closed(value: boolean): Poly {
        this.close = value;
        this.requestRedraw();
        return this;
    };
    getFramePoint(): tsvector.Vector {
        // get the first point of the polygon in frame coordinates
        return this.points[0];
    };
    setFramePoint(position: tsvector.Vector): void {
        // set the first point of the polygon in frame coordinates
        // offset the rest of the points by the same amount
        const offset = tsvector.vSub(position, this.points[0]);
        this.points = this.points.map((point) => tsvector.vAdd(point, offset));
    };
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Polygon is not attached to a frame.");
        }
        const frame = this.onFrame!;
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