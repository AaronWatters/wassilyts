
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

export class Frame {
    diagram: diagram.Diagram;
    affine: tsvector.Matrix;
    inv: tsvector.Matrix;
    constructor(inDiagram: diagram.Diagram, affineMatrix: tsvector.Matrix) {
        this.diagram = inDiagram;
        this.affine = affineMatrix;
        this.inv = tsvector.MInverse(affineMatrix);
    };
    applyAffine(affine: tsvector.Matrix, xy: tsvector.Vector): tsvector.Vector {
        const v3 = tsvector.MvProduct(affine, [...xy, 1]);
        return [v3[0], v3[1]];
    };
}
