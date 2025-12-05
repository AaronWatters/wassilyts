import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
  conveniences,
} from '../src/index';

describe('circle 3d', () => {
    it('should make a 3d circle', () => {
        const container = document.createElement('div');
        const pixelWidth = 150;
        const modelWidth = 20;
        const frame3d = conveniences.cube(container, pixelWidth, modelWidth);
        const circle3d = frame3d.circle([10, 20, 30], 5)
        // before draw depth should error
        expect(() => circle3d.depth()).toThrow();
        frame3d.onFrame.diagram.draw();
        // After draw depth should be a number
        const depth = circle3d.depth();
        expect(typeof depth).toEqual('number');
        expect(circle3d.center).toEqual([10, 20, 30]);
        expect(circle3d.radius).toEqual(5);
        // exercise trivial 3d marking methods
        circle3d.getPixel();
        circle3d.setPixel([15, 25]);
        circle3d.draw();
        // after forget circle should be defunct
        circle3d.forget();
        expect(circle3d.defunct).toBe(true);
    });
});