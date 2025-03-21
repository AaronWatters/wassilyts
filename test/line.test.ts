import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
} from '../src/index';

describe('line shape', () => {

    it('should center a line after fitting', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const line = frm.line([50, 20], [30, 40 ]);
        diag.draw();
        diag.fit();
        diag.draw();
        expect(line.start).toEqual([50, 20]);
        expect(line.end).toEqual([30, 40]);
        expect(diag.stats.minxy).toEqual([0, 0]);
        expect(diag.stats.maxxy).toEqual([100, 100]);
    });
    
    it('should make a line', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame; //new frame.Frame(diag);
        const line = frm.line([50, 20], [30, 80 ]);
        diag.draw();
        expect(line.start).toEqual([50, 20]);
        expect(line.end).toEqual([30, 80]);
        expect(diag.stats.minxy).toEqual([30, 20]);
        expect(diag.stats.maxxy).toEqual([50, 80]);
    });
    
});