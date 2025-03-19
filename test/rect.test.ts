import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
} from '../src/index';


describe('rect shape', () => {

    it('should make a rect', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const rect = frm.rect([0, 0], [100, 100]);
        diag.draw();
        expect(rect.point).toEqual([0, 0]);
        expect(rect.size).toEqual([100, 100]);
        expect(rect.offset).toEqual([0, 0]);
        expect(rect.scaled).toBeTruthy();
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });

    it('should make an offcenter rect', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const rect = frm.rect([10, 30], [20, 10]);
        diag.draw();
        expect(rect.point).toEqual([10, 30]);
        expect(rect.size).toEqual([20, 10]);
        expect(rect.offset).toEqual([0, 0]);
        expect(rect.scaled).toBeTruthy();
        expect(diag.stats.minxy).toEqual([10, 30]);
        expect(diag.stats.maxxy).toEqual([30, 40]);
    });

    it('should center a rect after fitting', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const rect = frm.rect([10, 30], [10, 10]);
        diag.draw();
        diag.fit();
        diag.draw();
        expect(rect.point).toEqual([10, 30]);
        expect(rect.size).toEqual([10, 10]);
        expect(rect.offset).toEqual([0, 0]);
        expect(rect.scaled).toBeTruthy();
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });

});