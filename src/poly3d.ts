
import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as marking from './marking';
import * as poly from './poly';
import * as tsvector from "tsvector";
import * as conveniences from './conveniences';
import { poly3d } from '.';

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

    normalVector(defaultV: tsvector.Vector | null = null, epsilon: number=1e-15): tsvector.Vector {
        if (this.points.length < 3) {
            throw new Error("At least 3 points are required to define a plane.");
        }
        const points = this.points;
        const p0 = points[0];
        const v1 = tsvector.vSub(points[1], p0);
        var v2;
        var normal;
        var normLength;
        for (let i = 2; i < points.length; i++) {
            v2 = tsvector.vSub(points[i], p0);
            normal = tsvector.vCross(v1, v2);
            normLength = tsvector.vLength(normal);
            if (normLength > epsilon) {
                return tsvector.vScale(1 / normLength, normal);
            }
        }
        /*
        console.log("All points:", this.points);
        console.log("v1:", v1);
        console.log("v2:", v2);
        console.log("normal:", normal);
        console.log("normLength:", normLength);
        */
        if (defaultV !== null) {
            return defaultV;
        }
        throw new Error("Points are collinear; cannot define a unique normal vector.");
    };

    normalColored(defaultV: tsvector.Vector | null = null, epsilon: number=1e-6): Poly3d {
        const normal = this.normalVector(defaultV, epsilon);
        const colorString = conveniences.rgb(normal, null, epsilon);
        this.colored(colorString);
        return this;
    };

};