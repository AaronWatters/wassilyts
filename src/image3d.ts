import * as marking3d from './marking3d';
import * as frame3d from './frame3d';
import * as rect3d from './rect3d';
import * as tsvector from "tsvector";
import * as marking from './marking';

export class Image3d extends rect3d.Rect3d {
    imagename: string;

    constructor(
        name: string,
        point: tsvector.Vector,
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        onFrame3d: frame3d.Frame3d,
        scaled: boolean = false,
        rotationDegrees: number = 0,
    ) {
        super(point, size, offset, onFrame3d, scaled, rotationDegrees);
        this.imagename = name;
    };

    projectTo2D(): marking.Marking {
        const { point2d, size, offset } = this.geometry2d();
        const image2d = this.onFrame!.namedImage(point2d, this.imagename, size, offset, this.scaled);
        image2d.degrees(this.rotationDegrees);
        image2d.styleLike(this);
        return image2d;
    }
}