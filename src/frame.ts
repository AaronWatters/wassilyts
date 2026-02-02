
import * as tsvector from 'tsvector';
import * as diagram from './diagram';
import * as styled from './styled';
import * as circle from './circle';
import * as rect from './rect';
import * as line from './line';
import * as poly from './poly';
import * as frame3d from './frame3d';
import * as projection from './projection';
import * as image from './image';
import * as textBox from './text';
import * as assembly from './assembly';

/** Handler returns true if the event was handled completely (no propagation needed). 
 * @param element The styled element that received the event, or null if none.
 * @param eventType The type of the event (e.g., "click", "mousemove").
 * @param canvasXY The coordinates of the event in canvas pixels.
 * @param cartesianXY The coordinates of the event in cartesian pixels.
 * @param frameXY The coordinates of the event in the frame's local coordinate system.
 * @returns True if the event was handled, false otherwise.
*/
export type frameEventHandler = (
    element: styled.Styled | null, // element can be null in frame with no marking picked
    eventType: string,
    canvasXY: tsvector.Vector, 
    cartesianXY: tsvector.Vector, 
    frameXY: tsvector.Vector,
    ) => boolean;

/** External handlers always handle the event and do not accept the element (for serialization). 
 * @param elementName The name of the styled element that received the event, or null if none.
 * @param eventType The type of the event (e.g., "click", "mousemove").
 * @param canvasXY The coordinates of the event in canvas pixels.
 * @param cartesianXY The coordinates of the event in cartesian pixels.
 * @param frameXY The coordinates of the event in the frame's local coordinate system.
*/
export type externalEventHandler = (
    elementName: string | null, // element can be null in frame with no marking picked
    eventType: string,
    canvasXY: tsvector.Vector, 
    cartesianXY: tsvector.Vector, 
    frameXY: tsvector.Vector,
    ) => void;  

export function translateScaleMatrix(
    translate: tsvector.Vector | null,
    scale: tsvector.Vector | null): tsvector.Matrix {
    if (translate === null) {
        translate = [0, 0];
    }
    if (scale === null) {
        scale = [1, 1];
    }
    return [
        [scale[0], 0, translate[0]],
        [0, scale[1], translate[1]],
        [0, 0, 1]
    ];
};

/** Create a matrix that maps a region from one coordinate system to another.
 * fromMinxy..fromMaxxy is the region in the parent frame.
 * toMinxy..toMaxxy is the region in the new frame.
 * The resulting matrix can be used to convert points from the parent frame to the new frame.
 */
export function regionMap(
    fromMinxy: tsvector.Vector, 
    fromMaxxy: tsvector.Vector, 
    toMinxy: tsvector.Vector, 
    toMaxxy: tsvector.Vector
): tsvector.Matrix {
    const fromSize = tsvector.vSub(fromMaxxy, fromMinxy);
    const toSize = tsvector.vSub(toMaxxy, toMinxy);
    const scale = tsvector.vDiv(toSize, fromSize);
    const translateToOrigin = translateScaleMatrix(tsvector.vScale(-1, fromMinxy), [1, 1]);
    const scaleMatrix = translateScaleMatrix([0, 0], scale);
    const translateToDestination = translateScaleMatrix(toMinxy, [1, 1]);
    return tsvector.MMProduct(translateToDestination, 
        tsvector.MMProduct(scaleMatrix, translateToOrigin));
};

export function applyAffine(affine: tsvector.Matrix, xy: tsvector.Vector): tsvector.Vector {
    const v3 = tsvector.MvProduct(affine, [...xy, 1]);
    return [v3[0], v3[1]];
};

const identity = tsvector.eye(3);

/**
 * A frame is a coordinate system within a diagram in which markings are drawn.
 * It can be nested, with a parent frame and child frames.
 * The affine matrix defines the transformation from the parent frame to this frame.
 * A frame is usually either the main frame for a diagram or a sub-frame derived
 * from another frame.
 * 
 * @extends styled.Styled
 * @param diagram The diagram this frame belongs to.
 * @param affineMatrix The affine transformation matrix from parent frame to this frame.
 * @param parent The parent frame, or null for the main frame.
 * @param font The font to use for text in this frame (default: "12px Arial").
 * 
 */
export class Frame extends styled.Styled {
    diagram: diagram.Diagram;
    // convert from parent model to local model
    affine: tsvector.Matrix = identity;
    // convert from local model to parent model
    inv: tsvector.Matrix = identity;
    // convert from cartesian pixel to local model
    pixelToModel: tsvector.Matrix = identity;
    // convert from local model to cartesian pixel
    ModelToPixel: tsvector.Matrix = identity;
    // record of all markings
    nameToMarking: Map<string, styled.Styled> = new Map();
    // draw ordered markings
    drawOrder: styled.Styled[] = [];
    // event handlers for frame events
    //typeToEventHandler: Map<string, frameEventHandler> = new Map();

    constructor(
        inDiagram: diagram.Diagram, 
        affineMatrix: tsvector.Matrix | null = null,
        parent: Frame | null = null,
        font: string = "12px Arial",
    ) {
        super(parent);
        this.diagram = inDiagram;
        this.onFrame = parent;
        if (affineMatrix === null) {
            // by default don't change coordinates
            affineMatrix = identity;
        }
        this.setAffine(affineMatrix);
        // by default the frame handles events
        this.responsive = true;
        this.font(font);
    };
    /** The pixel position is the frame origin in pixel coordinates.
     * @return The pixel position of the frame origin.
     */
    getPixel(): tsvector.Vector {
        return this.toPixel([0, 0]);
    };
    /** translate the origin to a new pixel position.
     * @param position The new pixel position of the frame origin.
     */
    setPixel(position: tsvector.Vector): void {
        // convert to model coordinates
        const model = this.toModel(position);
        const shift = tsvector.vScale(-1, model);
        const translation = translateScaleMatrix(shift, null);
        // create a new affine matrix with the additional translation
        const newAffine = tsvector.MMProduct(translation, this.affine);
        // set the new affine matrix
        this.setAffine(newAffine);
    };
    /** handle a mouse event.
     * @internal
     * @param event The mouse event to handle.
     * @param canvasXY The canvas coordinates of the mouse event.
     * @param cartesianXY The cartesian pixel coordinates of the mouse event.
     * @returns True if the event was handled, false otherwise.
     */
    frameEventHandler(
        event: MouseEvent,
        canvasXY: tsvector.Vector,
        cartesianXY: tsvector.Vector,
    ): boolean {
        return this.mouseEventHandler(event.type, canvasXY, cartesianXY, [0, 0]);
    };
    /** handle a mouse event.
     * @internal
     * @param eventtype The type of the event (e.g., "click", "mousemove").
     * @param canvasXY The coordinates of the event in canvas pixels.
     * @param cartesianXY The coordinates of the event in cartesian pixels.
     * @param frameXY0 The coordinates of the event in the frame's local coordinate system.
     * @returns True if the event was handled, false otherwise.
     */
    mouseEventHandler(eventtype: string, canvasXY: tsvector.Vector, cartesianXY: tsvector.Vector, frameXY0: tsvector.Vector): boolean {
        // xxxx is this redundant with styled mouseEventHandler?
        let handled = false;
        // convert to model coordinates
        const frameXY = this.toModel(cartesianXY);
        // call superclass for frame event handling
        handled = super.mouseEventHandler(eventtype, canvasXY, cartesianXY, frameXY);
        if (!handled) {
            // if not handled try to handle in markings
            const picked = this.pickedMarkings(canvasXY);
            // pop the markings until one handles the event or no more markings, reverse draw order
            while (picked.length > 0 && !handled) {
                const element = picked.pop();
                if (element) {
                    handled = element.mouseEventHandler(eventtype, canvasXY, cartesianXY, frameXY);
                }
            }
        }
        return handled;
    };
    /** Return all responsive markings that are picked by the canvas coordinates, in reverse draw order (topmost first)
     * @internal
    * @param canvasXY The coordinates in canvas pixels to test for picking.
    * @returns An array of responsive styled elements that are picked, in reverse draw order (topmost first).
    */
    pickedMarkings(canvasXY: tsvector.Vector): styled.Styled[] {
        // return all responsive markings that are picked by the canvas coordinates, in draw order
        const result: styled.Styled[] = [];
        for (const element of this.drawOrder) {
            if (element.responsive && element.pickObject(canvasXY)) {
                result.push(element);
            }
        }
        return result;
    };
    /** Rename a styled element in this frame and the containing diagram.
     * @param element The styled element to rename.
     * @param newName The new name for the element.
     */
    renameElement(element: styled.Styled, newName: string) {
        const n2m = this.nameToMarking;
        // error if the name is already taken
        if (n2m.has(newName)) {
            throw new Error(`Element name ${newName} already exists in frame ${this.objectName}`);
        }
        const oldName = element.objectName;
        if (n2m.has(oldName)) {
            const diagram = this.diagram;
            // rename in the diagram's named styled map
            if (diagram.getStyledByName(oldName) === null) {
                throw new Error(`Element ${oldName} not found in diagram during rename.`);
            }
            diagram.deleteStyled(element);
            // remove old name
            n2m.delete(oldName);
            // set new name
            element.objectName = newName;
            n2m.set(newName, element);
            diagram.addStyled(element);
            //this.requestRedraw(); -- rename does not require redraw
        } else {
            console.warn(`Element ${oldName} not found in frame ${this.objectName}`);
        }
    };
    /** Clear all elements from frame, forgetting them and removing from draw order and name map. */
    clear(redraw: boolean = true) {
        // for safety forget all elements
        this.nameToMarking.forEach((element) => {
            element.forget();
        });
        this.nameToMarking.clear();
        this.drawOrder = [];
        if (redraw) {
            this.requestRedraw();
        }
    };
    /** Receive canvas events of this eventType.
     * @param eventType String name of event to recieve.
     */
    watchEvent(eventType: string) {
        this.diagram.watchEvent(eventType);
    }
    /** Make an image usable in a diagram by name.
     * @param name The name to associate with the image.
     * @param image The HTMLImageElement to name.
     * @returns The current frame for chaining.
     */
    nameImage(name: string, image: HTMLImageElement) {
        this.diagram.nameImage(name, image);
        return this;
    };
    /** Make an image from a URL usable in a diagram by name.
     * @param name The name to associate with the image.
     * @param url The URL of the image to load and name.
     * @returns The current frame for chaining.
     */
    nameImageFromURL(name: string, url: string) {
        this.diagram.nameImageFromURL(name, url);
        return this;
    };
    /** Make an image from PNG binary data usable in a diagram by name.
     * @param name The name to associate with the image.
     * @param pngdata The PNG binary data as a Uint8Array.
     * @returns The current frame for chaining.
     */
    nameImageFromPNGData(name: string, pngdata: Uint8Array) {
        this.diagram.nameImageFromPNGData(name, pngdata);
        return this;
    };
    /** place an image using a PNG data (convenience, may leak memory if used too much)
     * @param point The location of the image in model coordinates.
     * @param pngdata The image data in PNG format.
     * @param size The size of the image in model units or pixels if not scaled(default: null for natural size).
     * @param offset The offset of the image from the point in model units (default: [0,0]).
     * @param scaled Whether the size is scaled (default: false).
     * @returns The created image marking.
    */
    pngImage(
        point: tsvector.Vector,
        pngdata: Uint8Array,
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ) {
        const name = this.freshName("png");
        this.nameImageFromPNGData(name, pngdata);
        return this.namedImage(point, name, size, offset, scaled);
    }
    /** Fit visible elements into canvas.
     * @param border Optional border in cartesian units to leave around fitted elements.  Default is 0.
     */
    fit(border: number = 0) {
        this.diagram.fit(border);
        this.requestRedraw();
    };
    /** Record a cartesian pixel point and convert to canvas coords.
     * @internal
     * @param xy The cartesian pixel coordinates of the point to add.
     * @returns The canvas coordinates of the added point.
    */
    addPixelPoint(xy: tsvector.Vector): tsvector.Vector {
        const diagram = this.diagram;
        const [x, y] = xy;
        diagram.addxy(x, y);
        return diagram.toCanvas(xy);
    };
    /**
     * Request a redraw of the diagram.
     */
    requestRedraw() {
        this.diagram.requestRedraw();
    };
    /** Pause automatic redraws of the diagram (in case of extensive updates) */
    pauseRedraw() {
        this.diagram.pauseRedraw();
    };
    /** Resume automatic redraws of the diagram, possibly after a pause */
    resumeRedraw() {
        this.diagram.resumeRedraw();
    };
    /** Add a model point, record its cartesian pixel coords and convert to canvas.
     * @internal
     * @param xy The model coordinates of the point to add.
     * @returns The canvas coordinates of the added point.
     */
    addPoint(xy: tsvector.Vector): tsvector.Vector {
        const pixel = this.toPixel(xy);
        return this.addPixelPoint(pixel);
    };
    /** Add a canvas pixel point, record its cartesian pixel coords and return frame model point.
     * @param xy The canvas coordinates of the point to add.
     * @return The model coordinates of the added point.
     * @internal
    */
    addPixel(xy: tsvector.Vector): tsvector.Vector {
        const diagram = this.diagram;
        const cartesian = diagram.toCartesian(xy);
        const model = this.toModel(cartesian);
        diagram.addPoint(cartesian);
        return model;
    }
    /** Set the affine transformation matrix from parent frame to this frame.
     * @param affineMatrix The affine transformation matrix to set.
     */
    setAffine(affineMatrix: tsvector.Matrix) {
        this.affine = affineMatrix;
        this.inv = tsvector.MInverse(affineMatrix);
        //this.prepareForRedraw();
        this.requestRedraw();
    };
    /**
     * Sync the pixel and model coordinate systems with the parent frame.
     * @internal
     */
    prepareForRedraw() {
        this.pixelToModel = this.affine;
        this.ModelToPixel = this.inv;
        let parent = this.onFrame;
        if (parent !== null) {
            this.pixelToModel = tsvector.MMProduct(this.affine, parent.pixelToModel);
            this.ModelToPixel = tsvector.MMProduct(parent.ModelToPixel, this.inv);
        }
        // sync all children
        this.nameToMarking.forEach((element) => {
            element.prepareForRedraw();
        });
    };
    /** Convert from model space to cartesian pixel space.
     * @param xy The model coordinates to convert.
     * @returns The cartesian pixel coordinates.
     * @internal
     */
    toPixel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.ModelToPixel, xy);
    };
    /** Convert from cartesian pixel space to model space
     * @param xy The cartesian pixel coordinates to convert.
     * @returns The model coordinates.
     * @internal
     */
    toModel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.pixelToModel, xy);
    };
    /** Create a frame for a subregion and record it. 
     * fromMinxy..fromMaxxy is the region in the current frame.
     * toMinxy..toMaxxy is the region in the new frame.
     * @param fromMinxy The minimum xy coordinates in the parent frame.
     * @param fromMaxxy The maximum xy coordinates in the parent frame.
     * @param toMinxy The minimum xy coordinates in the new frame.
     * @param toMaxxy The maximum xy coordinates in the new frame.
     * @return The new frame.
    */
    regionFrame(
        fromMinxy: tsvector.Vector,
        fromMaxxy: tsvector.Vector,
        toMinxy: tsvector.Vector,
        toMaxxy: tsvector.Vector
    ): Frame {
        const affine = regionMap(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        const result = new Frame(this.diagram, affine, this);
        this.addElement(result);
        return result;
    };
    /**
     * Create a 3d frame from a projection.
     * @internal
     * @param project The projection for the 3d frame.
     * @returns A new 3d frame attached to this 2d frame.
     */
    projectionFrame(
        project: projection.Projector
    ): frame3d.Frame3d {
        const result = new frame3d.Frame3d(this, project);
        this.addElement(result);
        return result;
    };
    /**
     * Create a 3d frame attached to this 2d frame.
     * @param eyePoint The "view origin" of the 3d projection.
     * @param lookAtPoint The "focus" of the 3d projection view.
     * @param perspective Whether to use perspective (true) or orthographic viewing (false)
     * @param upVector The "up" direction of the 3d projection view. Defaults to (0, 0, 1)
     * @returns A new 3d frame attached to this 2d frame.
     */
    frame3d(
        eyePoint: tsvector.Vector, 
        lookAtPoint: tsvector.Vector,
        perspective: boolean = true,
        upVector: tsvector.Vector | null = null
    ): frame3d.Frame3d {
        const projector = new projection.Projector(eyePoint, lookAtPoint, perspective, upVector);
        return this.projectionFrame(projector);
    };
    /**
     * Get a styled object from this diagram by name (convenience)
     * @param name 
     * @returns styled.Styled
     */
    getStyledByName(name: string): styled.Styled | null {
        return this.diagram.getStyledByName(name);
    };
    /** Record a marking.
     * @internal
     * @param styled The styled marking to add.
     * @param requestRedraw Whether to request a redraw after adding the element (default: true).   
     */
    addElement(styled: styled.Styled, requestRedraw=true) {
        const name = styled.objectName;
        // reset the diagram stats for new element
        const diagram = this.diagram;
        diagram.resetStats();
        diagram.addStyled(styled);
        this.nameToMarking.set(name, styled);
        this.drawOrder.push(styled);
        if (requestRedraw) {
            this.requestRedraw();
        }
    };
    /** iterate over all markings to draw.
     * @internal
     */
    draw() {
        //this.prepareForRedraw(); // xxx redundant?
        // check for defunct markings
        let dirty = false;
        // draw all markings in order
        const ctx = this.diagram.ctx!;
        ctx.save(); // save the context state
        this.applyStyle(ctx);
        for (const element of this.drawOrder) {
            if (element.defunct) {
                dirty = true;
            } else {
                element.draw();
            }
        };
        ctx.restore(); // restore the context state
        // remove defunct markings
        if (dirty) {
            let diagram = this.diagram;
            let n2m = this.nameToMarking;
            let newOrder: styled.Styled[] = [];
            for (const element of this.drawOrder) {
                if (!element.defunct) {
                    newOrder.push(element);
                } else {
                    n2m.delete(element.objectName);
                    diagram.deleteStyled(element);
                }
            }
            this.drawOrder = newOrder;
        }
    };
    /** line between two end points.
     * @param start The starting point of the line in model coordinates.
     * @param end The ending point of the line in model coordinates.
     * @returns The created line marking.   
     */
    line(start: tsvector.Vector, end: tsvector.Vector): line.Line {
        const result = new line.Line(this, start, end);
        this.addElement(result);
        return result;
    };
    /** A dot is a circle with an unscaled radius.
     * @param center The center of the dot in model coordinates.
     * @param radius The radius of the dot in model units.
     * @param scaled Whether the radius is scaled (default: false).
     * @returns The created circle marking.
    */
    dot(center: tsvector.Vector, radius: number, scaled=false): circle.Circle {
        const result = new circle.Circle(this, center, radius, scaled);
        //result.draw();
        this.addElement(result);
        return result;
    };
    /** A circle is a circle with a scaled radius.
     * @param center The center of the circle in model coordinates.
     * @param radius The radius of the circle in model units.
     * @param scaled Whether the radius is scaled (default: true).
     * @returns The created circle marking.
    */
    circle(center: tsvector.Vector, radius: number, scaled=true): circle.Circle {
        return this.dot(center, radius, scaled);
    };
    /** Place a named image.
     * @param point The location of the image in model coordinates.
     * @param name The name of the image to place.
     * @param size The size of the image in model units or pixels if not scaled(default: null for natural size).
     * @param offset The offset of the image from the point in model units (default: [0,0]).
     * @param scaled Whether the size is scaled (default: false).
     * @returns The created image marking.
    */
    namedImage(
        point: tsvector.Vector,
        name: string,
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ): image.Image {
        const source = this.diagram.getNamedImage(name);
        if (source === null) {
            throw new Error(`Named image ${name} not found in diagram.`);
        }
        const result = new image.Image(source, this, point, size, offset, scaled);
        this.addElement(result);
        return result;
    };
    /** place an image using a URL (convenience)
     * @param point The location of the image in model coordinates.
     * @param url The URL of the image to place.
     * @param size The size of the image in model units or pixels if not scaled(default: null for natural size).
     * @param offset The offset of the image from the point in model units (default: [0,0]).
     * @param scaled Whether the size is scaled (default: false).
     * @returns The created image marking.
    */
    imageFromURL(
        point: tsvector.Vector,
        url: string,
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ): image.Image {
        // load the image if not already loaded, named by its URL
        this.diagram.nameImageFromURL(url, url, false);
        return this.namedImage(point, url, size, offset, scaled);
    };
    /** A rectangle marking.
     * @param point The location of the rectangle in model coordinates.
     * @param size The size of the rectangle in model units (or pixels if not scaled).
     * @param offset The offset of the rectangle from the point in model units (default: [0,0]).
     * @param scaled Whether the size is scaled (default: true).
     * @param rotationDegrees The rotation of the rectangle in degrees (default: 0).
     * @returns The created rectangle marking.
    */
    rect(
        point: tsvector.Vector,
        size: tsvector.Vector,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = true,
        rotationDegrees: number = 0,
    ): rect.Rectangle {
        const result = new rect.Rectangle(this, point, size, offset, scaled, rotationDegrees);
        this.addElement(result);
        return result;
    };
    /** A text box. */
    textBox(
        point: tsvector.Vector,
        text: string,
        shift: tsvector.Vector = [0, 0],
        alignment: CanvasTextAlign = "left",
        background: string | null = null
    ): textBox.TextBox {
        const result = new textBox.TextBox(text, this, point, shift, alignment, background);
        this.addElement(result);
        return result;
    };
    /** A box is an unscaled rectangle.
     * @param point The location of the box in model coordinates.
     * @param size The size of the box in pixels.
     * @param offset The offset of the box from the point in pixels (default: [0,0]).
     * @param scaled Whether the size is scaled (default: false).
     * @returns The created rectangle marking.
     */
    box(
        point: tsvector.Vector,
        size: tsvector.Vector,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ): rect.Rectangle {
        return this.rect(point, size, offset, scaled);
    };
    /** A square is a centered unscaled rectangle with equal sides.
     * @param point The location of the square in model coordinates.
     * @param size The size of the square sides in pixels.
     * @param offset The offset of the square from the point in pixels (default: null for centered).
     * @param scaled Whether the size is scaled (default: false).
     * @returns The created rectangle marking.
     */
    square(
        point: tsvector.Vector,
        size: number,
        offset: tsvector.Vector | null = null, // default to center
        scaled: boolean = false
    ): rect.Rectangle {
        const result = rect.Square(this, point, size, offset, scaled);
        this.addElement(result);
        return result;
    };
    /** a polyline is a poly that is stroked and not closed,
     * @param points The points of the polyline in model coordinates.
     * @returns The created polyline marking.
     */
    polyline(points: tsvector.Vector[]): poly.Poly {
        const result =
         new poly.Poly(this, points);
        result.closed(false).stroked();
        this.addElement(result);
        return result;
    };
    /** a polygon is a poly that is filled and closed,
     * @param points The points of the polygon in model coordinates.
     * @returns The created polygon marking.
     */
    polygon(points: tsvector.Vector[]): poly.Poly {
        const result = new poly.Poly(this, points);
        result.closed().filled();
        this.addElement(result);
        return result;
    };
    /** A star shape.
     * @param innerRadius The inner radius of the star.
     * @param numPoints The number of points of the star (default: 5).
     * @param pointFactor The factor by which the outer radius exceeds the inner radius (default: 1.4).
     * @param degrees The rotation of the star in degrees (default: 0).
     * @returns The created star marking.
     */
    star(
        center: tsvector.Vector,
        innerRadius: number,
        numPoints: number = 5,
        pointFactor: number = 2,
        degrees: number = 0
    ): assembly.Star {
        const result = new assembly.Star(this, center, innerRadius, numPoints, pointFactor, degrees);
        this.addElement(result);
        return result;
    };
    arrow(
        back: tsvector.Vector,
        tip: tsvector.Vector,
        tipDegrees: number = 30,
        tipLength: number | null = null,
        tipFactor: number = 0.1
    ): assembly.Arrow {
        const result = new assembly.Arrow(this, back, tip, tipLength, tipDegrees, tipFactor);
        this.addElement(result);
        return result;
    };
};
