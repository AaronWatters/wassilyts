
import * as tsvector from 'tsvector';
import * as diagram from './diagram';
import * as styled from './styled';
import * as circle from './circle';
import * as rect from './rect';

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
    // parent frame or if null this is the primary frame.
    parent: Frame | null;
    // record of all markings
    nameToMarking: Map<string, styled.Styled> = new Map();

    constructor(
        inDiagram: diagram.Diagram, 
        affineMatrix: tsvector.Matrix | null = null,
        parent: Frame | null = null,
    ) {
        super();
        this.diagram = inDiagram;
        this.parent = parent;
        if (affineMatrix === null) {
            // by default don't change coordinates
            affineMatrix = identity;
        }
        this.setAffine(affineMatrix);
    };
    fit() {
        this.diagram.fit();
    };
    /** record a cartesian pixel point and convert to canvas coords */
    addPixelPoint(xy: tsvector.Vector): tsvector.Vector {
        const diagram = this.diagram;
        diagram.addPoint(xy);
        return diagram.toCanvas(xy);
    };
    /** Add a model point, record its cartesian pixel coords and convert to canvas. */
    addPoint(xy: tsvector.Vector): tsvector.Vector {
        const pixel = this.toPixel(xy);
        return this.addPixelPoint(pixel);
    };
    /** Add a canvas pixel point, record its cartesian pixel coords and return frame model point */
    addPixel(xy: tsvector.Vector): tsvector.Vector {
        const diagram = this.diagram;
        const cartesian = diagram.toCartesian(xy);
        const model = this.toModel(cartesian);
        diagram.addPoint(cartesian);
        return model;
    }
    setAffine(affineMatrix: tsvector.Matrix) {
        this.affine = affineMatrix;
        this.inv = tsvector.MInverse(affineMatrix);
        this.syncToParent();
    };
    syncToParent() {
        this.pixelToModel = this.affine;
        this.ModelToPixel = this.inv;
        if (this.parent !== null) {
            this.pixelToModel = tsvector.MMProduct(this.affine, this.parent.pixelToModel);
            this.ModelToPixel = tsvector.MMProduct(this.parent.ModelToPixel, this.inv);
        }
        // sync all children
        this.nameToMarking.forEach((element) => {
            element.syncToParent();
        });
    };
    /** Convert from model space to cartesian pixel space */
    toPixel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.ModelToPixel, xy);
    };
    /** Convert from cartesian pixel space to model space */
    toModel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.pixelToModel, xy);
    };
    /** Create a frame for a subregion and record it. 
     * fromMinxy..fromMaxxy is the region in the parent frame.
     * toMinxy..toMaxxy is the region in the new frame.
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
    /** Record a marking */
    addElement(styled: styled.Styled) {
        const name = styled.objectName
        this.nameToMarking.set(name, styled);
    };
    /** iterate over all markings to draw. */
    draw() {
        this.syncToParent();
        this.nameToMarking.forEach((element) => {
            element.draw();
        });
    };
    /** A dot is a circle with an unscaled radius. */
    dot(center: tsvector.Vector, radius: number, scaled=false): circle.Circle {
        const result = new circle.Circle(this, center, radius, scaled);
        //result.draw();
        this.addElement(result);
        return result;
    };
    /** A circle is a circle with a scaled radius. */
    circle(center: tsvector.Vector, radius: number, scaled=true): circle.Circle {
        return this.dot(center, radius, scaled);
    };
    rect(
        point: tsvector.Vector,
        size: tsvector.Vector,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = true
    ): rect.Rectangle {
        const result = new rect.Rectangle(this, point, size, offset, scaled);
        this.addElement(result);
        return result;
    };
    /** A box is an unscaled rectangle. */
    box(
        point: tsvector.Vector,
        size: tsvector.Vector,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ): rect.Rectangle {
        return this.rect(point, size, offset, scaled);
    };
    /** A square is a centered unscaled rectangle with equal sides */
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
};
