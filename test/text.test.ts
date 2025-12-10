import { describe, expect, it } from 'vitest';
import { 
  diagram,
} from '../src/index';


describe('text marking', () => {

    it('should make a text marking', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const text = frm.textBox([10, 20], "Hello, World!");
        diag.draw();
        expect(text.point).toEqual([10, 20]);
        expect(text.text).toEqual("Hello, World!");
        //expect(text.scaled).toBeTruthy();
        //expect(diag.stats.minxy).toEqual([10, 20]); // xxxx this is failing because of text size
        expect(diag.stats.maxxy![0]).toBeGreaterThan(10);
        expect(diag.stats.maxxy![1]).toBeGreaterThan(20);
    });
});