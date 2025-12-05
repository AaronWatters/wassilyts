import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as marking from './marking';
//import * as line from './line';
import * as tsvector from "tsvector";

export class Circle3d extends marking3d.Marking3d {
    center: tsvector.Vector;
    radius: number;
    scaled: boolean;

    constructor(center: tsvector.Vector, radius: number, onFrame3d: frame3d.Frame3d, scaled: boolean = true) {
        super(onFrame3d);
        this.center = center;
        this.radius = radius;
        this.scaled = scaled;
    };

    projectTo2D(): marking.Marking {
        // Project the 3D center to 2D using the projection matrix
        const centerProj = this.onFrame3d.projection.project(this.center);
        const center2d = this.to2d(centerProj);
        // depth as the projected z value
        this.depthValue = centerProj[2];
        // Create a 2D circle marking
        const radius = this.radius;
        if (this.scaled) {
            // Adjust radius based on distance from camera
            const scale = this.onFrame3d.projection.distanceScale(this.center);
            const radius = this.radius * scale;
        }
        //const circle2d = new circle.Circle(this.onFrame!, center2d, this.radius, this.scaled);
        const circle2d = this.onFrame!.circle(center2d, this.radius, this.scaled);
        circle2d.styleLike(this);
        return circle2d;
    };
};