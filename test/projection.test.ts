import { describe, expect, it } from 'vitest';

import {
    projection,
} from '../src/index';

describe('projection module', () => {
    it('should compute a perpendicular component', () => {
        const toVector = [1, 0, 0];
        const fromVector = [1, 1, 0];
        const result = projection.perpendicularComponent(toVector, fromVector);
        expect(result).toEqual([0, 1, 0]);
    });
    it('should compute a projection matrix', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = [0, 1, 0];
        const matrix = projection.ProjectionMatrix(eyePoint, lookAtPoint, upVector);
        const expectedMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        expect(matrix).toEqual(expectedMatrix); // Replace with expected matrix
    });
    it('should compute a projection matrix with default up vector', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        //const upVector = [0, 1, 0];
        const matrix = projection.ProjectionMatrix(eyePoint, lookAtPoint);
        const expectedMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        expect(matrix).toEqual(expectedMatrix); // Replace with expected matrix
    });
    it('should compute a projection matrix looking in the y direction', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 1, 0];
        //const upVector = [0, 1, 0];
        const matrix = projection.ProjectionMatrix(eyePoint, lookAtPoint);
        const expectedMatrix = [
            [0, 0, 1, 0],
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1]
        ];
        expect(matrix).toEqual(expectedMatrix);
    });
    it('should compute a projection matrix with offsets', () => {
        const eyePoint = [1, -1, 1];
        const lookAtPoint = [1, -1, 2];
        //const upVector = [0, 1, 0];
        const matrix = projection.ProjectionMatrix(eyePoint, lookAtPoint);
        const expectedMatrix = [
            [1, 0, 0, -1],
            [0, 1, 0, 1],
            [0, 0, 1, -1],
            [0, 0, 0, 1]
        ];
        expect(matrix).toEqual(expectedMatrix);
    });
    it('should project points', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = [0, 1, 0];
        const projector = new projection.Projector(eyePoint, lookAtPoint, true, upVector);
        const point3d = [2, 3, 1];
        const projected = projector.project(point3d);
        const expected = [2, 3, 1];
        expect(projected).toEqual(expected);
        const point3d2 = [4, 6, 2];
        const projected2 = projector.project(point3d2);
        const expected2 = [2, 3, 2];
        expect(projected2).toEqual(expected2);
    });

    it('should project points with default up vector', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = null;
        const projector = new projection.Projector(eyePoint, lookAtPoint, true, upVector);
        const point3d = [2, 3, 1];
        const projected = projector.project(point3d);
        const expected = [2, 3, 1];
        expect(projected).toEqual(expected);
        const point3d2 = [4, 6, 2];
        const projected2 = projector.project(point3d2);
        const expected2 = [2, 3, 2];
        expect(projected2).toEqual(expected2);
        // test distance scale
        const dist = projector.distanceScale([0,0,10]);
        expect(dist).toEqual(0.1);
        // test offset rotation
        const offsetRot = projector.XYOffsetRotation([0,0], [1,0]);
        expect(offsetRot).toBeDefined();
    });

    it('should rotate', () => {
        // smoke test for rotation
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = null;
        const projector1 = new projection.Projector(eyePoint, lookAtPoint, true, upVector);
        const rotationMatrix = [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0]
        ];
        const projector = projector1.rotation(rotationMatrix)   
        const point3d = [0, 0, 1];
        const projected = projector.project(point3d);
        const expected = [0, 0, 1];
        expect(projected).toEqual(expected);
    });

    it('should project points with default up vector orthographically', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = null;
        const projector = new projection.Projector(eyePoint, lookAtPoint, false, upVector);
        const point3d = [2, 3, 1];
        const projected = projector.project(point3d);
        const expected = [2, 3, 1];
        expect(projected).toEqual(expected);
        const point3d2 = [4, 6, 2];
        const projected2 = projector.project(point3d2);
        const expected2 = [4, 6, 2];
        expect(projected2).toEqual(expected2);
    });

    it('should change view', () => {
        const eyePoint1 = [1, 0, 1];
        const lookAtPoint1 = [0, 0, 1];
        const upVector1 = [0, 1, 0];
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = null;
        const projector = new projection.Projector(eyePoint1, lookAtPoint1, true, upVector1);
        expect(projector.upVector).toEqual(upVector1);
        projector.lookAt(lookAtPoint);
        projector.lookFrom(eyePoint, upVector1);
        expect(projector.upVector).toEqual(upVector1);
        const point3d = [2, 3, 1];
        const projected = projector.project(point3d);
        const expected = [2, 3, 1];
        expect(projected).toEqual(expected);
        const point3d2 = [4, 6, 2];
        const projected2 = projector.project(point3d2);
        const expected2 = [2, 3, 2];
        expect(projected2).toEqual(expected2);
    });

    it('should error if eye and lookAt are the same', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 0];
        const upVector = [0, 1, 0];
        expect(() => new projection.Projector(eyePoint, lookAtPoint, true, upVector)).toThrow();
    });

    /* not used.
    it ('should compute an x orbit rotation matrix', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = [0, 1, 0];
        const projector = new projection.Projector(eyePoint, lookAtPoint, true, upVector);
        const orbitMatrix = projection.OrbitRotation([1,0]);
        expect(orbitMatrix).toBeDefined();
        expect(orbitMatrix[1][1]).toBe(1);
    });

    it ('should compute an y orbit rotation matrix', () => {
        const eyePoint = [0, 0, 0];
        const lookAtPoint = [0, 0, 1];
        const upVector = [0, 1, 0];
        const projector = new projection.Projector(eyePoint, lookAtPoint, true, upVector);
        const orbitMatrix = projection.OrbitRotation([0,1]);
        expect(orbitMatrix).toBeDefined();
        expect(orbitMatrix[0][0]).toBe(1);
        //expect(orbitMatrix).toBe(1);
    });*/
});