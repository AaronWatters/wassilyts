/**
 * Frame with 3D primatives, projecting to 2D
 */

import * as tsvector from "tsvector";
import * as frame from './frame';
import * as projection from './projection';
import * as styled from './styled';
import * as marking3d from './marking3d';
import * as marking from './marking';
import * as line from './line3d';

export class Frame3d extends styled.Styled {
    projection: projection.Projector;
    //fromFrame: frame.Frame;
    onFrame: frame.Frame;
    nameToMarking3d: Map<string, marking3d.Marking3d> = new Map();

    constructor(fromFrame: frame.Frame, projection: projection.Projector) {
        super(fromFrame);
        this.projection = projection;
        /**
         * The dedicated frame for drawing the 3D projection.
         */
        this.onFrame = new frame.Frame(fromFrame.diagram, null, fromFrame);
    };

    prepareForRedraw(): void {
        // draw the 3D markings onto the onFrame
        this.onFrame.clear();
        this.onFrame.styleLike(this);
        // project 3d markings to 2d.
        const depthsAndMarkings: [number, marking.Marking][] = [];
        this.nameToMarking3d.forEach((marking3d) => {
            const marking2d = marking3d.projectTo2D();
            const depth = marking3d.depth();
            depthsAndMarkings.push([depth, marking2d]);
        });
        // sort by depth, so that the furthest away is drawn first
        depthsAndMarkings.sort((a, b) => b[0] - a[0]);
        // draw the markings in order of largest depth to smallest depth
        depthsAndMarkings.forEach(([, marking2d]) => {
            this.onFrame.addElement(marking2d);
        });
        this.onFrame.prepareForRedraw();
    };

    draw() {
        this.onFrame.draw();
    };

    getPixel(): tsvector.Vector {
        // return the pixel position of the frame in the diagram
        return this.onFrame.getPixel();
    };

    setPixel(position: tsvector.Vector): void {
        // set the pixel position of the frame in the diagram
        this.onFrame.setPixel(position);
    };

    line(start: tsvector.Vector, end: tsvector.Vector): marking3d.Line3d {
        // create a 3D line marking
        const line3d = new line.Line3d(start, end, this);
        this.nameToMarking3d.set(line3d.objectName, line3d);
        return line3d;
    };
};

