import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
} from '../src/index';

describe('frame module', () => {
    it('should invert a region', () => {
        const fromMinxy = [10, 10];
        const fromMaxxy = [20, 20];
        const toMinxy = [100, 200];
        const toMaxxy = [110, 100];
        const affine = frame.regionMap(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        const test = [11,11]
        const result = frame.applyAffine(affine, test);
        expect(result).toEqual([101, 190]);
    });
    it('should expand a region', () => {
        const fromMinxy = [1, 17];
        const fromMaxxy = [2, 10];
        const toMinxy = [256, 512];
        const toMaxxy = [1024, 1024];
        const affine = frame.regionMap(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        const result = frame.applyAffine(affine, fromMinxy);
        expect(result).toEqual(toMinxy);
        const result2 = frame.applyAffine(affine, fromMaxxy);
        expect(result2).toEqual(toMaxxy);
    });
    it('should shrink a region', () => {
        const toMinxy = [1, 17];
        const toMaxxy = [2, 10];
        const fromMinxy = [256, 512];
        const fromMaxxy = [1024, 1024];
        const affine = frame.regionMap(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        const result = frame.applyAffine(affine, fromMinxy);
        expect(result).toEqual(toMinxy);
        const result2 = frame.applyAffine(affine, fromMaxxy);
        expect(result2).toEqual(toMaxxy);
    });
    it('should make a frame with no parent', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = new frame.Frame(diag);
        expect(frm.diagram).toBe(diag);
        expect(frm.parent).toBeNull();
        expect(frm.toPixel([0, 0])).toEqual([0, height]);
        expect(frm.toPixel([width, height])).toEqual([width, 0]);
        expect(frm.toModel([0, height])).toEqual([0, 0]);
        expect(frm.toModel([width, 0])).toEqual([width, height]);
    });
    it('should make a frame with a parent', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const parent = new frame.Frame(diag);
        const fromMinxy = [10, 10];
        const fromMaxxy = [20, 20];
        const toMinxy = [100, 200];
        const toMaxxy = [110, 100];
        const frm = parent.regionFrame(fromMinxy, fromMaxxy, toMinxy, toMaxxy);
        expect(frm.diagram).toBe(diag);
        expect(frm.parent).toBe(parent);
        expect(frm.toPixel(toMaxxy)).toEqual(parent.toPixel(fromMaxxy));
        expect(frm.toModel(parent.toPixel(fromMinxy))).toEqual(toMinxy);
    });
});