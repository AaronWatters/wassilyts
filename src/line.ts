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
    startAt(position: tsvector.Vector): Line {
        // set the start point of the line in frame coordinates
        this.start = position;
        this.requestRedraw();
        return this;
    };
    endAt(position: tsvector.Vector): Line {
        // set the end point of the line in frame coordinates
        this.end = position;
        this.requestRedraw();
        return this;
    };
    getFramePoint(): tsvector.Vector {
        // get the start point of the line in frame coordinates
        return this.start;
    };
    setFramePoint(position: tsvector.Vector): void {
        // set the start point of the line in frame coordinates
        // offset the end by the same amount
        const offset = tsvector.vSub(position, this.start);
        this.start = position;
        this.end = tsvector.vAdd(this.end, offset);
        //this.requestRedraw();
    };
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Line is not attached to a frame.");
        }
        const frame = this.onFrame!;
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