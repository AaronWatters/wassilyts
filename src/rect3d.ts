import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as marking from './marking';
import * as tsvector from "tsvector";

export class Rect3d extends marking3d.Marking3d {

    point: tsvector.Vector;
    size: tsvector.Vector | null;
    offset: tsvector.Vector;
    scaled: boolean;
    rotationDegrees: number = 0;

    constructor(
        point: tsvector.Vector,
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        onFrame3d: frame3d.Frame3d,
        scaled: boolean = true,
        rotationDegrees: number = 0,
    ) {
        super(onFrame3d);
        this.point = point;
        this.size = size;
        this.offset = offset;
        this.scaled = scaled;
        this.rotationDegrees = rotationDegrees;
    };
    
    projectTo2D(): marking.Marking {
        const { point2d, size, offset } = this.geometry2d();
        const rect2d = this.onFrame!.rect(point2d, size, offset, this.scaled, this.rotationDegrees);
        rect2d.styleLike(this);
        return rect2d;
    };

    geometry2d(): { point2d: tsvector.Vector; size: tsvector.Vector; offset: tsvector.Vector } {
        if (this.scaled && (this.size === null)) {
            throw new Error("Rect3d size is null, cannot project to 2D.");
        }
        // xxx fragment cut/paste from circle3d
        const pointProj = this.onFrame3d.projection.project(this.point);
        const point2d = this.to2d(pointProj);
        // depth as the projected z value
        this.depthValue = pointProj[2];
        let size = this.size;
        let offset = this.offset;
        if (this.scaled) {
            // Adjust size and offset based on distance from camera
            const scale = this.onFrame3d.projection.distanceScale(this.point);
            size = tsvector.vScale(scale, size!);
            offset = tsvector.vScale(scale, offset);
        }
        return { point2d: point2d, size: size!, offset: offset };
    }

    // xxx this should use mixin like tricks...
    degrees(rotationDegrees: number): Rect3d {
        // set the rotation of the rectangle in degrees
        this.rotationDegrees = rotationDegrees;
        this.requestRedraw();
        return this;
    };
    resize(size: tsvector.Vector): Rect3d {
        // set the size of the rectangle
        this.size = size;
        this.requestRedraw();
        return this;
    };
    offsetBy(offset: tsvector.Vector): Rect3d {
        // set the offset of the rectangle
        this.offset = offset;
        this.requestRedraw();
        return this;
    };
    scaling(scaled: boolean): Rect3d {
        // set whether the rectangle is scaled or not
        this.scaled = scaled;
        this.requestRedraw();
        return this;
    };
    locateAt(position: tsvector.Vector): Rect3d {
        // set the point of the rectangle in frame coordinates
        this.point = position;
        this.requestRedraw();
        return this;
    };
    setFramePoint(position: tsvector.Vector): void {
        // set the point of the rectangle in frame coordinates
        this.point = position;
    };
}