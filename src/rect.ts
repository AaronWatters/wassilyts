import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
import * as marking from './marking';
import * as conveniences from './conveniences';

/**
 * A simple rectangle marking.
 * Can be rotated, scaled or unscaled.
 */
export class Rectangle extends marking.Marking {
    point: tsvector.Vector;
    size: tsvector.Vector | null;
    offset: tsvector.Vector;
    scaled: boolean;
    rotationDegrees: number = 0;
    constructor(
        frame: frame.Frame, 
        point: tsvector.Vector, 
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = true,
        rotationDegrees: number = 0,
    ) {
        super(frame);
        this.point = point;
        this.size = size;
        this.offset = offset;
        this.scaled = scaled;
        this.rotationDegrees = rotationDegrees;
    };
    degrees(rotationDegrees: number): Rectangle {
        // set the rotation of the rectangle in degrees
        this.rotationDegrees = rotationDegrees;
        this.requestRedraw();
        return this;
    };
    resize(size: tsvector.Vector): Rectangle {
        // set the size of the rectangle
        this.size = size;
        this.requestRedraw();
        return this;
    };
    offsetBy(offset: tsvector.Vector): Rectangle {
        // set the offset of the rectangle
        this.offset = offset;
        this.requestRedraw();
        return this;
    };
    scaling(scaled: boolean): Rectangle {
        // set whether the rectangle is scaled or not
        this.scaled = scaled;
        this.requestRedraw();
        return this;
    };
    locateAt(position: tsvector.Vector): Rectangle {
        // set the point of the rectangle in frame coordinates
        this.point = position;
        this.requestRedraw();
        return this;
    };
    setFramePoint(position: tsvector.Vector): void {
        // set the point of the rectangle in frame coordinates
        this.point = position;
    };
    getFramePoint(): tsvector.Vector {
        // get the point of the rectangle in frame coordinates
        return this.point;
    };
    /* unrotated rectangle path
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Rectangle is not attached to a frame.");
        }
        const frame = this.onFrame!;
        const path = new Path2D();
        let pixelStart: tsvector.Vector;
        let pixelSize: tsvector.Vector;
        ({pixelStart, pixelSize} = this.getPixelStartAndSize());
        //const [px, py] = pixelStart;
        const [sx, sy] = pixelSize;
        //const cstart = frame.diagram.toCartesian(pixelStart);
        const [cx, cy] = frame.diagram.toCanvas(pixelStart);
        path.rect(cx, cy, sx, -sy);
        //console.log(`translated rectangle at ${this.point} with size ${this.size}`);
        //console.log(`to rectangle at ${cx}, ${cy} with size ${this.size}`);
        //console.log("sx, sy: ", sx, sy);
        // add reference points to diagram
        frame.addPixelPoint(pixelStart);
        frame.addPixelPoint(tsvector.vAdd(pixelStart, [sx, 0]));
        frame.addPixelPoint(tsvector.vAdd(pixelStart, [0, sy]));
        frame.addPixelPoint(tsvector.vAdd(pixelStart, pixelSize));
        return path;
    };
    */
    // rotated rectangle path
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Rectangle is not attached to a frame.");
        }
        const frame = this.onFrame!;
        const path = new Path2D();
        let pixelStart: tsvector.Vector;
        let pixelSize: tsvector.Vector;
        ({pixelStart, pixelSize} = this.getPixelStartAndSize());
        // get the point of the rectangle in canvas coordinates
        const pixelPoint = frame.toPixel(this.point);
        const canvasPoint = frame.diagram.toCanvas(pixelPoint);
        //console.log("Pixel point: ", canvasPoint, "from frame point: ", this.point);
        //console.log("start and size: ", pixelStart, pixelSize);
        const [sx, sy] = pixelSize;
        // get the four corners of the rectangle in pixel coordinates
        const rotation = new conveniences.Rotation2d(-this.rotationDegrees, canvasPoint);
        const canvasStart = frame.diagram.toCanvas(pixelStart);
        //console.log("Canvas start: ", canvasStart, "from pixel start: ", pixelStart);
        const unrotatedCorners: tsvector.Vector[] = [
            canvasStart,
            tsvector.vAdd(canvasStart, [sx, 0]),
            tsvector.vAdd(canvasStart, [sx, -sy]),
            tsvector.vAdd(canvasStart, [0, -sy]),
        ];
        //console.log("Unrotated rectangle corners: ", unrotatedCorners);
        const rotatedCorners: tsvector.Vector[] = unrotatedCorners.map((pix) => {
            return rotation.transformPoint(pix);
        });
        // move to first corner
        const [fx, fy] = rotatedCorners[0];
        path.moveTo(fx, fy);
        //console.log("Rotated rectangle corners: ", rotatedCorners);
        // line to remaining corners
        rotatedCorners.slice(1).forEach((corner) => {
            const [x, y] = corner;
            path.lineTo(x, y);
        });
        path.closePath();
        // add reference points to diagram
        rotatedCorners.forEach((corner) => {
            frame.addPixelPoint(frame.diagram.toCartesian(corner));
        });
        return path;
    };
    getPixelStartAndSize(): {pixelStart: tsvector.Vector, pixelSize: tsvector.Vector} {
        let size = this.size;
        if (size === null) {
            throw new Error("Rectangle size is not defined.");
        }
        if (!this.isLive()) {
            throw new Error("Rectangle is not attached to a frame.");
        }
        const frame = this.onFrame!;
        let pixelStart: tsvector.Vector;
        let pixelSize: tsvector.Vector;
        let point = this.point;
        let offset = this.offset;
        let lowerLeftCartesian: tsvector.Vector;
        let upperLeftCartesian: tsvector.Vector;
        if (this.scaled) {
            // offset and size are scaled.
            let lowerleftFrame = tsvector.vAdd(point, offset);
            let upperleftFrame = tsvector.vAdd(lowerleftFrame, size);
            lowerLeftCartesian = frame.toPixel(lowerleftFrame);
            upperLeftCartesian = frame.toPixel(upperleftFrame);
        } else {
            // offset and size are unscaled
            let pointCartesian = frame.toPixel(point);
            lowerLeftCartesian = tsvector.vAdd(pointCartesian, offset);
            upperLeftCartesian = tsvector.vAdd(lowerLeftCartesian, size);
        }
        // record the pixel points in the diagram (for fitting purposes)
        //frame.addPixelPoint(lowerLeftCartesian);
        //frame.addPixelPoint(upperLeftCartesian);
        let [llx, lly] = lowerLeftCartesian;
        let [ulx, uly] = upperLeftCartesian;
        pixelStart = [Math.min(llx, ulx), Math.min(lly, uly)];
        let pixelEnd = [Math.max(llx, ulx), Math.max(lly, uly)];
        pixelSize = tsvector.vSub(pixelEnd, pixelStart);
        return {pixelStart, pixelSize};
    };
    getPixelStartAndSize0(): {pixelStart: tsvector.Vector, pixelSize: tsvector.Vector} {
        // historical...
        let size = this.size;
        if (size === null) {
            throw new Error("Rectangle size is not defined.");
        }
        if (!this.isLive()) {
            throw new Error("Rectangle is not attached to a frame.");
        }
        const frame = this.onFrame!;
        let pixelStart: tsvector.Vector;
        let pixelSize: tsvector.Vector;
        if (this.scaled) {
            // offset and size are scaled
            const start = tsvector.vAdd(this.point, this.offset);
            const end = tsvector.vAdd(start, size);
            pixelStart = frame.toPixel(start);
            const endPixel = frame.toPixel(end);
            pixelSize = tsvector.vSub(endPixel, pixelStart);
        } else {
            // offset and size are unscaled, invert y
            const offset1 = [this.offset[0], -this.offset[1]];
            const size1 = [size[0], -size[1]];
            const pointPixel = frame.toPixel(this.point);
            pixelStart = tsvector.vAdd(pointPixel, offset1);
            pixelSize = size1;
        }
        return {pixelStart, pixelSize};
    }
};

export function Square(
    frame: frame.Frame, 
    point: tsvector.Vector, 
    size: number, 
    offset: tsvector.Vector | null = null, 
    scaled: boolean = false) {
    if (offset === null) {
        const half = size / 2;
        offset = [-half, -half];
    }
    return new Rectangle(frame, point, [size, size], offset, scaled);
};
