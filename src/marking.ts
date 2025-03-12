
import * as tsvector from 'tsvector';
import * as diagram from './diagram';
import * as frame from './frame';

export abstract class Marking {
    onFrame: frame.Frame;
    constructor(frame: frame.Frame) {
        this.onFrame = frame;
    };
    abstract drawPath(): Path2D;
    // default draw method
    draw() {
        const path = this.drawPath();
        this.onFrame.diagram.ctx!.stroke(path);
    };
    testPixel(xy: tsvector.Vector): boolean {
        const path = this.drawPath();
        return this.onFrame.diagram.ctx!.isPointInStroke(path, xy[0], xy[1]);
    };
};