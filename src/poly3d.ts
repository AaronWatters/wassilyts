
import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as marking from './marking';
import * as poly from './poly';
import * as tsvector from "tsvector";

export class Poly3d extends marking3d.Marking3d {
    points: tsvector.Vector[];
    close: boolean = true;

    constructor(points: tsvector.Vector[], onFrame3d: frame3d.Frame3d) {
        super(onFrame3d);
        this.points = points;
    };

    closed(value: boolean = true): Poly3d {
        this.close = value;
        this.requestRedraw();
        return this;
    };

    projectTo2D(): marking.Marking {
        // Project the 3D points to 2D using the projection matrix
        const projectedPoints = this.points.map(point => this.onFrame3d.projection.project(point));
        const points2d = projectedPoints.map(p => this.to2d(p));
        // Create a 2D poly marking
        //const poly2d = new poly.Poly(this.onFrame!, points2d);
        const poly2d = this.onFrame!.polygon(points2d);
        poly2d.closed(this.close);
        poly2d.styleLike(this);
        // Set the depth based on the average Z value of the projected points
        this.depthValue = projectedPoints.reduce((sum, p) => sum + p[2], 0) / projectedPoints.length;
        return poly2d;
    };
};