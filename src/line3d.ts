
import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as marking from './marking';
import * as line from './line';
import * as tsvector from "tsvector";

export class Line3d extends marking3d.Marking3d {
    start: tsvector.Vector;
    end: tsvector.Vector;

    constructor(start: tsvector.Vector, end: tsvector.Vector, onFrame3d: frame3d.Frame3d) {
        super(onFrame3d);
        this.start = start;
        this.end = end;
        this.stroked();
    }

    projectTo2D(): marking.Marking {
        // For simplicity, we can just return a line marking in 2D.
        //debugger;
        const onFrame3d = this.onFrame3d;
        const startProj = onFrame3d.projection.project(this.start);
        const endProj = onFrame3d.projection.project(this.end);
        // depth as midpoint of projected z values
        this.depthValue = (startProj[2] + endProj[2]) / 2;
        // Create a 2D line marking
        //const result = new line.Line(this.onFrame!, this.to2d(startProj), this.to2d(endProj));
        const result = this.onFrame!.line(this.to2d(startProj), this.to2d(endProj));
        result.styleLike(this);
        return result;
    };

}