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
import * as text3d from './text3d';


/**
 * 3D Frame which projects to a 2D Frame.
 * Markings added to this frame are 3D markings
 * which are projected to 2D for drawing, sorted by depth (approximate)
 * so that near objects are drawn over far objects.
 */
export class Frame3d extends styled.Styled {
    projection: projection.Projector;
    //fromFrame: frame.Frame;
    toFrame: frame.Frame;
    nameToMarking3d: Map<string, marking3d.Marking3d> = new Map();
    orbiter: orbiter.Orbiter | null = null;

    constructor(fromFrame: frame.Frame, projection: projection.Projector) {
        super(fromFrame);
        this.projection = projection;
        /**
         * The dedicated frame for drawing the 3D projection.
         * This must come after self in draw order for toFrame for redraw preparation.
         */
        this.toFrame = new frame.Frame(fromFrame.diagram, null, fromFrame);
        fromFrame.addElement(this.toFrame);
    };

    /**
     * Set up an orbiter to control this frame to allow interactive rotation via mouse dragging.
     * @returns orbiter.Orbiter
     */
    orbit(): orbiter.Orbiter {
        // create an orbiter for this frame
        if (this.orbiter === null) {
            this.orbiter = new orbiter.Orbiter(this)
        }
        return this.orbiter;
    };

    /**
     * Clear all 3D markings from this frame.
     */
    clear(): void {
        // for safety forget all 3D markings
        this.nameToMarking3d.forEach((element) => {
            element.forget()
        });
        // clear the 3D markings
        this.nameToMarking3d.clear();
        // clear the onFrame
        this.toFrame.clear();
    };

    /**
     * Prepare the 3D frame for redraw by projecting all 3D markings to 2D and drawing them in depth order.
     * @internal
     */
    prepareForRedraw(): void {
        // draw the 3D markings onto the onFrame
        // clear the onFrame without requesting redraw
        const toFrame = this.toFrame;
        const diagram = toFrame.diagram;
        try {
            //diagram.disableRedraws();
            toFrame.clear(false);
            toFrame.styleLike(this);
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
                toFrame.addElement(marking2d);
            });
            // prepare is automatic in containing frame.
        } finally {
            //diagram.enableRedraws();
        }   
    };

    /**
     * Fit the frame to enclose all 3D markings.
     * @param border Number of pixels of border to leave around the fitted markings.
     */
    fit(border: number = 0): void {
        // fit the frame to the 3D markings
        if (this.nameToMarking3d.size === 0) {
            // if there are no markings, do nothing
            return;
        }
        // fit the onFrame to the 3D markings
        this.toFrame.fit(border);
    };

    /**
     * Draw the frame by drawing the onFrame.
     * @internal
     */
    draw() {
        this.toFrame.draw();
    };

    /**
     * Return the pixel position of the frame in the diagram.
     * @returns [number, number] pixel position
     */
    getPixel(): tsvector.Vector {
        // return the pixel position of the frame in the diagram
        return this.toFrame.getPixel();
    };

    /**
     * set the pixel position of the frame in the diagram.  
     * @param position 
     */
    setPixel(position: tsvector.Vector): void {
        // set the pixel position of the frame in the diagram
        this.toFrame.setPixel(position);
    };
    
    /**
     * Register an image with a name in the frame's image cache.
     * @param name 
     * @param image 
     * @returns frame3d.Frame3d for chaining
     */
    nameImage(name: string, image: HTMLImageElement) {
        this.toFrame.nameImage(name, image);
        return this;
    };

    /**
     * Register an image from a URL with a name in the frame's image cache.
     * @param name 
     * @param url 
     * @returns frame3d.Frame3d for chaining
     */
    nameImageFromURL(name: string, url: string) {
        this.toFrame.nameImageFromURL(name, url);
        return this;
    };

    /**
     * Position a named image in 3D space.
     * @param point 
     * @param imagename 
     * @param size 
     * @param offset 
     * @param scaled 
     * @returns 
     */
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

    /**
     * place an image from a URL in 3D space.
     * @param point 
     * @param url 
     * @param size 
     * @param offset 
     * @param scaled 
     * @returns 
     */
    imageFromURL(
        point: tsvector.Vector, 
        url: string, 
        size: tsvector.Vector | null = null, 
        offset: tsvector.Vector = [0, 0], 
        scaled: boolean = false): image3d.Image3d 
    {
        this.toFrame.diagram.nameImageFromURL(url, url, false);
        return this.namedImage(point, url, size, offset, scaled);
    };
    /**
     * Position a text box in 3D space.
     * @param point the position of the text box in 3D space
     * @param text the text string
     * @param shift 
     * @param alignment the text alignment like "left", "center, "right"
     * @param background background color string or null for no background
     * @returns text3d.TextBox3d
     */
    textBox(
        point: tsvector.Vector, 
        text: string, 
        shift: tsvector.Vector = [0, 0], 
        alignment: CanvasTextAlign = "left", 
        background: string | null = null): text3d.TextBox3d 
    {
        const textbox = new text3d.TextBox3d(text, point, shift, alignment, background, this);
        this.nameToMarking3d.set(textbox.objectName, textbox);
        return textbox;
    };

    /**
     * Position a 3D line marking between two points.
     * @param start 
     * @param end 
     * @returns line3d.Line3d
     */
    line(start: tsvector.Vector, end: tsvector.Vector): line3d.Line3d {
        // create a 3D line marking
        const line = new line3d.Line3d(start, end, this);
        this.nameToMarking3d.set(line.objectName, line);
        return line;
    };

    /**
     * Add a polygon of polyline marking in 3D space.
     * Use poly.closed(false) to make it a polyline.
     * Use poly.stroked(), .filled(), .colored(), etc to style it.
     * @param points 
     * @returns 
     */
    poly(points: tsvector.Vector[]): poly3d.Poly3d {
        // create a 3D poly marking
        const poly = new poly3d.Poly3d(points, this);
        this.nameToMarking3d.set(poly.objectName, poly);
        return poly;
    };

    polygon(points: tsvector.Vector[]): poly3d.Poly3d {
        const result = this.poly(points);
        result.closed(true).filled();
        return result;
    };

    polyline(points: tsvector.Vector[]): poly3d.Poly3d {
        const result = this.poly(points);
        result.closed(false).stroked();
        return result;
    };

    /**
     * Add a circle marking in 3D space.
     * @param center the center of the circle in 3D space
     * @param radius the radius of the circle
     * @returns circle3d.Circle3d
     */
    circle(center: tsvector.Vector, radius: number, scaled: boolean = true): circle3d.Circle3d {
        // create a 3D circle marking
        const circle = new circle3d.Circle3d(center, radius, this, scaled);
        this.nameToMarking3d.set(circle.objectName, circle);
        return circle;
    }

    /**
     * Add a rectangle marking in 3D space.
     * @param point the position of the rectangle in 3D space
     * @param size the size of the rectangle in 3D space
     * @param offset the offset of the rectangle in 3D space
     * @param scaled whether to scale the rectangle
     * @param rotationDegrees the rotation of the rectangle in degrees
     * @returns rect3d.Rect3d
     */
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

