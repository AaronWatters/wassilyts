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
        affine3d(tsvector.vAdd(E, Vz)),  // don't distort the Z axis
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
/* not used
export function OrbitRotation(offset: tsvector.Vector): tsvector.Matrix {
    const [dx, dy] = offset;
    const theta = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    const phi = Math.atan2(length, 1); // assuming distance from eye to focus is 1 unit
    const Mtheta = tsvector.Mroll(-theta);
    const Mphi = tsvector.Mpitch(-phi);
    // Combine the rotations: first roll, then pitch
    const rotatedtheta = tsvector.MMProduct(Mphi, Mtheta);
    // rotate back by theta
    const MthetaBack = tsvector.Mroll(theta)
    const rotated = tsvector.MMProduct(MthetaBack, rotatedtheta);
    // convert to Affine matrix
    const affine = tsvector.affine3d(rotated);
    return affine;
};*/

export class Projector {
    eyePoint: tsvector.Vector;
    lookAtPoint: tsvector.Vector;
    upVector: tsvector.Vector;
    projectionMatrix: tsvector.Matrix | null = null;
    focusLength: number = 1; // distance from eye to focus point
    zscale: number = 1;
    perspective: boolean = true;

    constructor(
        eyePoint: tsvector.Vector, 
        lookAtPoint: tsvector.Vector,
        perspective: boolean = true,
        upVector: tsvector.Vector | null = null) {
        this.eyePoint = eyePoint;
        this.lookAtPoint = lookAtPoint;
        if (upVector === null) {
            upVector = [0, 1, 0]; // default up vector
        }
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
        const zDirection = tsvector.vSub(this.lookAtPoint, this.eyePoint);
        const length = tsvector.vLength(zDirection);
        if (length < epsilon) {
            throw new Error("Eye point and look at point are too close together.");
        }
        const zNormalized = tsvector.vNormalize(zDirection);
        // adjust the up vector
        var upComponent = perpendicularComponent(zNormalized, this.upVector);
        if (tsvector.vLength(upComponent) < epsilon) {
            // xxxx this should be smarter, but for now just use a default
            upComponent = perpendicularComponent(zNormalized, [1, 1, 0]);
        }
        this.upVector = tsvector.vNormalize(upComponent);
        this.focusLength = length;
        this.zscale = length;
        this.projectionMatrix = ProjectionMatrix(this.eyePoint, this.lookAtPoint, this.upVector, epsilon);
        return this.projectionMatrix;
    };

    /** Rotate the projection by moving the eye point around the lookAt point.
     * @param rotationMatrix3d - The rotation matrix to apply in projected space.
     */
    rotation(rotationMatrix3d: tsvector.Matrix): Projector {
        const upVector = this.upVector;
        const lookAtPoint = this.lookAtPoint;
        const eyePoint = this.eyePoint;
        const orientation = this.orientation();
        const inverseOrientation = tsvector.MInverse(orientation);
        // adjust the rotation matrix to the orientation of the model
        const orientProjection = tsvector.MMProduct(rotationMatrix3d, orientation);
        const oriented = tsvector.MMProduct(inverseOrientation, orientProjection);
        const newUpVector = tsvector.MvProduct(oriented, upVector);
        const offset = tsvector.vSub(eyePoint, lookAtPoint);
        const newoffset = tsvector.MvProduct(oriented, offset);
        const newEyePoint = tsvector.vAdd(lookAtPoint, newoffset);
        const result = new Projector(newEyePoint, lookAtPoint, this.perspective, newUpVector);
        return result;
    };

    /** 3x3 3d rotation matrix based on xy offset adjusted by focuslength  */
    XYOffsetRotation(
        startXY: tsvector.Vector,
        endXY: tsvector.Vector,
    ) {
        // Create a rotation matrix for the XY mouse offset
        const offset = tsvector.vSub(endXY, startXY);
        const [dx, dy] = offset;
        const focusLength = this.focusLength;
        //("Focus Length:", focusLength, "Offset:", offset);
        const rotation = this.rotateYawPitch(-dx / focusLength, -dy / focusLength);
        return rotation;
    };

    rotateXY(startXY: tsvector.Vector, endXY: tsvector.Vector, projectionMatrix: tsvector.Matrix | null): Projector {
        // Create a rotation matrix for the XY mouse offset
        const offset = tsvector.vSub(endXY, startXY);
        const [dx, dy] = offset;
        const focusLength = this.focusLength;
        //("Focus Length:", focusLength, "Offset:", offset);
        //const affineRotation = OrbitRotation([dx / focusLength, dy / focusLength]);
        const rotation = this.rotateYawPitch(dx / focusLength, dy / focusLength);
        const affineRotation = tsvector.affine3d(rotation);
        return this.rotate(affineRotation, projectionMatrix);
    };

    rotateYawPitch(pitch: number, yaw: number): tsvector.Matrix {
        // Create rotation matrices for yaw and pitch
        const Myaw = tsvector.Myaw(-yaw);
        const Mpitch = tsvector.Mpitch(-pitch);
        //("Yaw:", yaw, "Pitch:", pitch);
        // Combine the rotations: first roll, then pitch
        const rotated = tsvector.MMProduct(Mpitch, Myaw);
        return rotated;
    };

    /** Rotate the projection matrix by the given affine rotation matrix at the lookAtPoint.
     * @param affineRotation - The affine rotation matrix to apply.
     * @param projectionMatrix - Optional, if not provided, will use the current projection matrix.
     */
    rotate(affineRotation: tsvector.Matrix, projectionMatrix: tsvector.Matrix | null = null): Projector {
        if (projectionMatrix === null) {
            if (this.projectionMatrix === null) {
                this.getProjectionMatrix();
            }
            projectionMatrix = this.projectionMatrix;
        }
        debugger
        // projectionMatrix is currently at the eyePoint
        // Apply the rotation at the lookAtPoint and then translate back to the eyePoint
        const shift = tsvector.vSub(this.eyePoint, this.lookAtPoint);
        const translateToLookAt = tsvector.affine3d(null, shift);
        const translated = tsvector.MMProduct(translateToLookAt, projectionMatrix!);
        const rotated = tsvector.MMProduct(affineRotation, translated);
        const invRotation = tsvector.MInverse(affineRotation);
        const rotatedShiftAffine = tsvector.MvProduct(invRotation, affine3d(shift));
        const rotatedShift = rotatedShiftAffine.slice(0, 3); // drop the last element
        const translateBack = tsvector.affine3d(null, tsvector.vScale(-1, rotatedShift));
        this.projectionMatrix = tsvector.MMProduct(translateBack, rotated);
        return this;
    };

    orientation(): tsvector.Matrix {
        // Return the orientation matrix of the projector
        if (this.projectionMatrix === null) {
            this.getProjectionMatrix(); 
        }
        // The orientation is the 3x3 part of the projection matrix
        const projection = this.projectionMatrix!;
        return [
            projection[0].slice(0, 3),
            projection[1].slice(0, 3),
            projection[2].slice(0, 3),
        ];
    };

    project(xyz: tsvector.Vector): tsvector.Vector {
        if (this.projectionMatrix === null) {
            this.getProjectionMatrix();
        }
        const affine = affine3d(xyz);
        const projected = tsvector.MvProduct(this.projectionMatrix!, affine);
        // reduce z by scale factor
        projected[2] /= this.zscale;
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
