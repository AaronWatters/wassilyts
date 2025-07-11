/** 
 * 3D Marking which must be projected to 2D for display.
 */

import * as styled from './styled';
import * as marking from './marking';
import * as frame3d from './frame3d';
import * as tsvector from "tsvector";

export abstract class Marking3d extends styled.Styled {
    onFrame3d: frame3d.Frame3d;
    depthValue: number | null = null; // depth can be calculated or set

    constructor(onFrame3d: frame3d.Frame3d) {
        super(onFrame3d.onFrame);
        this.onFrame3d = onFrame3d;
    };
    abstract projectTo2D(): marking.Marking;
    depth(): number {
        if (this.depthValue !== null) {
            return this.depthValue;
        } else {
            throw new Error("Depth not set for Marking3d.");
        }
    };
    to2d(from3dProjected: tsvector.Vector): tsvector.Vector {
        // Convert a 3D point to a 2D point using the projection matrix
        return [from3dProjected[0], from3dProjected[1]];
    };
    // trivial getPixel, setPixel, and draw methods
    getPixel(): tsvector.Vector {
        return [];
    };
    setPixel(position: tsvector.Vector): void {
        // No-op for 3D markings
    };
    draw(): void {
        // No-op for 3D markings, as they are drawn in the Frame3d context
    };
};
