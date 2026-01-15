/**
 * Frame with 3D primatives, projecting to 2D
 */

import * as tsvector from "tsvector";
import * as frame from './frame';
import * as projection from './projection';
import * as orbiter from './orbiter';
import * as styled from './styled';
import * as marking3d from './marking3d';
import * as marking from './marking';
import * as line3d from './line3d';
import * as poly3d from './poly3d';
import * as circle3d from './circle3d';
import * as rect3d from './rect3d';
import * as image3d from './image3d';
import { rect } from ".";

export class Frame3d extends styled.Styled {
    projection: projection.Projector;
    //fromFrame: frame.Frame;
    onFrame: frame.Frame;
    nameToMarking3d: Map<string, marking3d.Marking3d> = new Map();
    orbiter: orbiter.Orbiter | null = null;

    constructor(fromFrame: frame.Frame, projection: projection.Projector) {
        super(fromFrame);
        this.projection = projection;
        /**
         * The dedicated frame for drawing the 3D projection.
         */
        this.onFrame = new frame.Frame(fromFrame.diagram, null, fromFrame);
        fromFrame.addElement(this.onFrame);
    };

    requestRedraw(): void {
        // request a redraw of the frame
        this.onFrame.requestRedraw();
    };

    orbit(): orbiter.Orbiter {
        // create an orbiter for this frame
        if (this.orbiter === null) {
            this.orbiter = new orbiter.Orbiter(this)
        }
        return this.orbiter;
    };

    clear(): void {
        // for safety forget all 3D markings
        this.nameToMarking3d.forEach((element) => {
            element.forget()
        });
        // clear the 3D markings
        this.nameToMarking3d.clear();
        // clear the onFrame
        this.onFrame.clear();
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

    fit(border: number = 0): void {
        // fit the frame to the 3D markings
        if (this.nameToMarking3d.size === 0) {
            // if there are no markings, do nothing
            return;
        }
        // fit the onFrame to the 3D markings
        this.onFrame.fit(border);
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
    
    nameImage(name: string, image: HTMLImageElement) {
        this.onFrame.nameImage(name, image);
        return this;
    };

    nameImageFromURL(name: string, url: string) {
        this.onFrame.nameImageFromURL(name, url);
        return this;
    };

    namedImage(
        point: tsvector.Vector, 
        imagename: string, 
        size: tsvector.Vector | null = null, 
        offset: tsvector.Vector = [0, 0], 
        scaled: boolean = false): image3d.Image3d {
        const image = new image3d.Image3d(imagename, point, size, offset, this, scaled);
        this.nameToMarking3d.set(image.objectName, image);
        return image;
    };

    line(start: tsvector.Vector, end: tsvector.Vector): line3d.Line3d {
        // create a 3D line marking
        const line = new line3d.Line3d(start, end, this);
        this.nameToMarking3d.set(line.objectName, line);
        return line;
    };

    poly(points: tsvector.Vector[]): poly3d.Poly3d {
        // create a 3D poly marking
        const poly = new poly3d.Poly3d(points, this);
        this.nameToMarking3d.set(poly.objectName, poly);
        return poly;
    };

    circle(center: tsvector.Vector, radius: number): circle3d.Circle3d {
        // create a 3D circle marking
        const circle = new circle3d.Circle3d(center, radius, this);
        this.nameToMarking3d.set(circle.objectName, circle);
        return circle;
    }

    rect(
        point: tsvector.Vector,
        size: tsvector.Vector,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = true,
        rotationDegrees: number = 0,
    ): rect3d.Rect3d {
        // create a 3D rectangle marking
        const rectangle = new rect3d.Rect3d(point, size, offset, this, scaled, rotationDegrees);
        this.nameToMarking3d.set(rectangle.objectName, rectangle);
        return rectangle;
    };

};

