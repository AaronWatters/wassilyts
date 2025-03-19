import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
} from '../src/index';

describe('circle shape', () => {

    it('should make a circle', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const center = [50, 50];
        const radius = 50;
        const circ = frm.circle(center, radius);
        diag.draw();
        expect(circ.center).toEqual(center);
        expect(circ.radius).toEqual(radius);
        expect(circ.scaled).toBeTruthy();
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });
    
    it('should make an offcenter circle', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const cx = 30;
        const cy = 70;
        const center = [cx, cy];
        const radius = 10;
        const circ = frm.circle(center, radius);
        diag.draw();
        expect(circ.center).toEqual(center);
        expect(circ.radius).toEqual(radius);
        expect(circ.scaled).toBeTruthy();
        expect(diag.stats.minxy).toEqual([cx - radius, (cy - radius)]);
        expect(diag.stats.maxxy).toEqual([cx + radius, (cy + radius)]);
    });
    
    it('should center a circle after fitting', () => {
        console.log(typeof Path2D);
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const cx = 30;
        const cy = 70;
        const center = [cx, cy];
        const radius = 10;
        const circ = frm.circle(center, radius);
        diag.draw();
        diag.fit();
        diag.draw();
        expect(circ.center).toEqual(center);
        expect(circ.radius).toEqual(radius);
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });
});