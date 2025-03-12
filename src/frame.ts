
import * as tsvector from 'tsvector';
import * as diagram from './diagram';

export function translateScaleMatrix(
    translate: tsvector.Vector,
    scale: tsvector.Vector): tsvector.Matrix {
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

const identity = tsvector.eye(4);

export class Frame {
    diagram: diagram.Diagram;
    affine: tsvector.Matrix = identity;
    inv: tsvector.Matrix = identity;
    pixelToModel: tsvector.Matrix = identity;
    ModelToPixel: tsvector.Matrix = identity;
    parent: Frame | null;
    constructor(
        inDiagram: diagram.Diagram, 
        affineMatrix: tsvector.Matrix | null = null,
        parent: Frame | null = null,
    ) {
        this.diagram = inDiagram;
        this.parent = parent;
        if (affineMatrix === null) {
            if (parent !== null) {
                affineMatrix = identity;
            } else {
                const width = this.diagram.width;
                const height = this.diagram.height;
                const minxy = [0, height];
                const maxxy = [width, 0];
                const origin = [0, 0];
                const wh = [width, height];
                affineMatrix = regionMap(origin, wh, minxy, maxxy);
            }
        }
        this.setAffine(affineMatrix);
    };
    setAffine(affineMatrix: tsvector.Matrix) {
        this.affine = affineMatrix;
        this.inv = tsvector.MInverse(affineMatrix);
        this.pixelToModel = this.affine;
        this.ModelToPixel = this.inv;
        if (this.parent !== null) {
            this.pixelToModel = tsvector.MMProduct(this.affine, this.parent.pixelToModel);
            this.ModelToPixel = tsvector.MMProduct(this.parent.ModelToPixel, this.inv);
        } 
    };
    toPixel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.ModelToPixel, xy);
    };
    toModel(xy: tsvector.Vector): tsvector.Vector {
        return applyAffine(this.pixelToModel, xy);
    };
    regionFrame(
        fromMinxy: tsvector.Vector,
        fromMaxxy: tsvector.Vector,
        toMinxy: tsvector.Vector,
        toMaxxy: tsvector.Vector
    ): Frame {
        const affine = regionMap(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        return new Frame(this.diagram, affine, this);
    };
};
