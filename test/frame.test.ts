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
        expect(frm.onFrame).toBeNull();
        expect(frm.addPoint([0, 0])).toEqual([0, height]);
        expect(frm.addPoint([width, height])).toEqual([width, 0]);
        expect(frm.addPixel([0, height])).toEqual([0, 0]);
        expect(frm.addPixel([width, 0])).toEqual([width, height]);
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
        expect(frm.onFrame).toBe(parent);
        expect(frm.addPoint(toMaxxy)).toEqual(parent.addPoint(fromMaxxy));
        expect(frm.addPixel(parent.addPoint(fromMinxy))).toEqual(toMinxy);
    });
    it('should center a pixel point', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = new frame.Frame(diag);
        const result = frm.addPixelPoint([width / 2, height / 2]);
        expect(result).toEqual([width / 2, height / 2]);
    });
    it('should convert a pixel point to canvas coordinates', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = new frame.Frame(diag);
        const result = frm.addPixelPoint([0,0]);
        expect(result).toEqual([0, height]);
    });
    it('should convert a model point to canvas coordinates', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = new frame.Frame(diag);
        const fromMin = [10, 10];
        const fromMax = [20, 40];
        const toMin = [10, 20];
        const toMax = [30, 60];
        const frame0 = frm.regionFrame(fromMin, fromMax, toMin, toMax);
        const frommiddle = [(fromMin[0] + fromMax[0]) / 2, (fromMin[1] + fromMax[1]) / 2];
        const tomiddle = [(toMin[0] + toMax[0]) / 2, (toMin[1] + toMax[1]) / 2];
        const canvasmiddle = [frommiddle[0], height - frommiddle[1]];
        const result = frame0.addPoint(tomiddle);
        expect(result).toEqual(canvasmiddle);
    });
    it('should convert a canvas point to model coordinates', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const fromMin = [10, 10];
        const fromMax = [20, 40];
        const toMin = [10, 20];
        const toMax = [30, 60];
        const frame0 = frm.regionFrame(fromMin, fromMax, toMin, toMax);
        const canvasfrommax = [fromMax[0], height - fromMax[1]];
        const result = frame0.addPixel(canvasfrommax);
        expect(result).toEqual(toMax);
        expect(diag.stats.minxy).toEqual(fromMax);
        const canvasfrommin = [fromMin[0], height - fromMin[1]];
        const result2 = frame0.addPixel(canvasfrommin);
        expect(result2).toEqual(toMin);
        expect(diag.stats.minxy).toEqual(fromMin);
        expect(diag.stats.maxxy).toEqual(fromMax);
    });
    it('should sync frames', () => {
        const container = document.createElement('div');
        const width = 120;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const fromMin = [10, 10];
        const fromMax = [20, 40];
        const toMin = [10, 20];
        const toMax = [30, 60];
        const frame0 = frm.regionFrame(fromMin, fromMax, toMin, toMax);
        const translateScale = frame.translateScaleMatrix([4, -2], [1, 1]);
        frm.setAffine(translateScale);
        frm.syncToParent();
        const frmorigin = frm.addPoint([0,0]);
        expect(frmorigin).toEqual([-4, height - 2]);
        const frame0origin = frame0.addPoint(toMin);
        expect(frame0origin).toEqual([fromMin[0]-4, height - (fromMin[1]+2)]);
        //expect(frm.addPoint(toMin)).toEqual([(fromMin[0]-4)/2, height - (fromMin[1]+2)/2]);
    });
});