import { describe, expect, it } from 'vitest';
import { 
  frame
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
});