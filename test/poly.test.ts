import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
} from '../src/index';

describe('poly shape', () => {

    it('should make a polyline', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const poly = frm.polyline([[50, 20], [30, 80], [70, 80]]);
        diag.draw();
        expect(poly.points).toEqual([[50, 20], [30, 80], [70, 80]]);
        expect(poly.close).toBeFalsy();
        expect(poly.stroke).toBeTruthy();
        expect(diag.stats.minxy).toEqual([30, 20]);
        expect(diag.stats.maxxy).toEqual([70, 80]);
    });
    it('should make a polygon', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const poly = frm.polygon([[50, 20], [30, 80], [70, 80]]);
        diag.draw();
        expect(poly.points).toEqual([[50, 20], [30, 80], [70, 80]]);
        expect(poly.close).toBeTruthy();
        expect(poly.stroke).toBeFalsy();
        expect(diag.stats.minxy).toEqual([30, 20]);
        expect(diag.stats.maxxy).toEqual([70, 80]);
    });
    it('should scale a polygon after fitting', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const poly = frm.polygon([[50, 20], [30, 80], [90, 80]]);
        diag.draw();
        diag.fit();
        diag.draw();
        expect(poly.points).toEqual([[50, 20], [30, 80], [90, 80]]);
        expect(poly.close).toBeTruthy();
        expect(poly.stroke).toBeFalsy();
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });
});