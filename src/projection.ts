/**
 * Project from 3d coordinates to 2d coordinates.
 */

import * as tsvector from "tsvector";

const EPSILON = 1e-6;

/**
 * Calculate the perpendicular component of one vector relative to another.
 * @param toVector - Perpendicular to this vector.
 */
export function perpendicularComponent(toVector: tsvector.Vector, fromVector: tsvector.Vector): tsvector.Vector {
    // Calculate the perpendicular component of fromVector perpendicular to toVector.
    const V = toVector;
    const D = fromVector;
    const n = tsvector.vNormalize(V);
    const dot = tsvector.vDot(n, D);
    const proj = tsvector.vScale(dot, n);
    const perp = tsvector.vSub(D, proj);
    return perp;
};

export function affine3d(xyz: tsvector.Vector): tsvector.Vector {
    // Convert a 3D vector to a 4D affine vector.
    // This is used for projection calculations.
    return [xyz[0], xyz[1], xyz[2], 1];
};

export function ProjectionMatrix(
    eyePoint: tsvector.Vector,
    lookAtPoint: tsvector.Vector,
    upVector: tsvector.Vector | null = null,
    epsilon = EPSILON,
): tsvector.Matrix
{
    const E = eyePoint;
    const C = lookAtPoint;
    const direction = tsvector.vSub(C, E);
    const length = tsvector.vLength(direction);
    if (length < epsilon) {
        throw new Error("Eye point and look at point are too close together.");
    }
    const Vz = tsvector.vNormalize(direction);
    if (upVector === null) {
        upVector = [0, 1, 0]; // default up vector
    }
    upVector = perpendicularComponent(Vz, upVector);
    if (tsvector.vLength(upVector) < epsilon) {
        upVector = perpendicularComponent(Vz, [1, 1, 0]);
    }
    const up = tsvector.vNormalize(upVector);
    const right = tsvector.vNormalize(tsvector.vCross(up, Vz));
    const At = [
        affine3d(tsvector.vAdd(E, right)),
        affine3d(tsvector.vAdd(E, up)),
        affine3d(C),
        affine3d(E),
    ];
    const A = tsvector.MTranspose(At);
    const B = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 1]
    ];
    const invA = tsvector.MInverse(A);
    const result = tsvector.MMProduct(B, invA);
    return result;
};

/** Compute the rotation to apply to the 3d model to orbit around the focus point
 * when the mouse is offset by the given amount.
 * Assuming the distance from the eye to the focus point is 1 unit,
 */
export function OrbitRotation(offset: tsvector.Vector): tsvector.Matrix {
    const [dx, dy] = offset;
    const theta = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    const phi = Math.atan2(length, 1); // assuming distance from eye to focus is 1 unit
    const Mtheta = tsvector.Mroll(theta);
    const Mphi = tsvector.Mpitch(phi);
    // Combine the rotations: first roll, then pitch
    const rotatedtheta = tsvector.MMProduct(Mphi, Mtheta);
    // rotate back by theta
    const MthetaBack = tsvector.Mroll(-theta)
    const rotated = tsvector.MMProduct(MthetaBack, rotatedtheta);
    // convert to Affine matrix
    const affine = tsvector.affine3d(rotated);
    return affine;
};

export class Projector {
    eyePoint: tsvector.Vector;
    lookAtPoint: tsvector.Vector;
    upVector: tsvector.Vector | null;
    projectionMatrix: tsvector.Matrix | null = null;
    perspective: boolean = true;

    constructor(
        eyePoint: tsvector.Vector, 
        lookAtPoint: tsvector.Vector,
        perspective: boolean = true,
        upVector: tsvector.Vector | null = null) {
        this.eyePoint = eyePoint;
        this.lookAtPoint = lookAtPoint;
        this.upVector = upVector;
        this.perspective = perspective;
        this.getProjectionMatrix();
    };

    lookAt(lookAtPoint: tsvector.Vector, epsilon = EPSILON): Projector {
        this.lookAtPoint = lookAtPoint;
        this.projectionMatrix = null; // reset the projection matrix
        this.getProjectionMatrix(epsilon);
        return this;
    };

    lookFrom(eyePoint: tsvector.Vector, epsilon = EPSILON): Projector {
        this.eyePoint = eyePoint;
        this.projectionMatrix = null; // reset the projection matrix
        this.getProjectionMatrix(epsilon);
        return this;
    };

    getProjectionMatrix(epsilon = EPSILON): tsvector.Matrix {
        this.projectionMatrix = ProjectionMatrix(this.eyePoint, this.lookAtPoint, this.upVector, epsilon);
        return this.projectionMatrix;
    };

    project(xyz: tsvector.Vector): tsvector.Vector {
        if (this.projectionMatrix === null) {
            this.getProjectionMatrix();
        }
        const affine = affine3d(xyz);
        const projected = tsvector.MvProduct(this.projectionMatrix!, affine);
        // Convert back to 3D coordinates
        const P = [projected[0] / projected[3], projected[1] / projected[3], projected[2] / projected[3]];
        if (this.perspective) {
            // Perspective projection with z perserved for sorting
            const scale = 1 / P[2]
            return [P[0] * scale, P[1] * scale, P[2]];
        } else {
            // Orthographic projection
            return [P[0], P[1], P[2]]; // orthographic projection
        }
    };
}
