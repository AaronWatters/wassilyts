import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as marking from './marking';

export class Line extends marking.Marking {
    start: tsvector.Vector;
    end: tsvector.Vector;
    constructor(frame: frame.Frame, start: tsvector.Vector, end: tsvector.Vector) {
        super(frame);
        this.start = start;
        this.end = end;
        this.stroked();
    };
    drawPath(): Path2D {
        const frame = this.onFrame;
        const path = new Path2D();
        let pixelStart = frame.addPoint(this.start);
        let pixelEnd = frame.addPoint(this.end);
        const [sx, sy] = pixelStart;
        const [ex, ey] = pixelEnd;
        path.moveTo(sx, sy);
        path.lineTo(ex, ey);
        // add reference points to diagram
        frame.addPixelPoint(frame.diagram.toCartesian(pixelStart));
        frame.addPixelPoint(frame.diagram.toCartesian(pixelEnd));
        return path;
    };
}