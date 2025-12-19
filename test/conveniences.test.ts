import { describe, expect, it } from 'vitest';
import { 
  frame,
  diagram,
  conveniences,
} from '../src/index';
import ts from 'typescript';

describe('convenience functions', () => {

    it('should create a panel', () => {
        const container = document.createElement('div');
        const width = 200;
        const height = 200;
        const minxy = [-100, -100];
        const maxxy = [10, 10];
        const frame = conveniences.panel(container, minxy, maxxy, width, height);
        const diag = frame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(width);
        expect(diag.height).toEqual(height);
    });

    it('should create a panel from an id', () => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        //const container1 = document.getElementById('test-container') as HTMLElement;
        const width = 200;
        const height = 200;
        const minxy = [-100, -100];
        const maxxy = [10, 10];
        const frame = conveniences.panel("test-container", minxy, maxxy, width, height);
        const diag = frame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(width);
        expect(diag.height).toEqual(height);
    });

    it('should throw if the panel extent is too small', () => {
        const container = document.createElement('div');
        const width = 200;
        const height = 200;
        const minxy = [0, 0];
        const maxxy = [1e-8, 1e-8];
        expect(() => conveniences.panel(container, minxy, maxxy, width, height)).toThrow();
    });

    it('should throw if width or height are nonpositive', () => {
        const container = document.createElement('div');
        const minxy = [0, 0];
        const maxxy = [10, 10];
        expect(() => conveniences.panel(container, minxy, maxxy, 0, 100)).toThrow();
        expect(() => conveniences.panel(container, minxy, maxxy, 100, 0)).toThrow();
    });

    it('should infer height if null', () => {
        const container = document.createElement('div');
        const width = 200;
        const minxy = [0, 0];
        const maxxy = [10, 20];
        const frame = conveniences.panel(container, minxy, maxxy, width, null);
        const diag = frame.diagram;
        expect(diag.height).toEqual(400); // aspect ratio 2:1
    });

    it('should create a swatch', () => {
        const container = document.createElement('div');
        const pixelWidth = 100;
        const modelWidth = 10;
        const modelCenter = [1000, 2000];
        const frame = conveniences.swatch(container, pixelWidth, modelWidth, modelCenter);
        const diag = frame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(pixelWidth);
        expect(diag.height).toEqual(pixelWidth);
    });
    it('should create a swatch with default center', () => {
        const container = document.createElement('div');
        const pixelWidth = 100;
        const modelWidth = 10;
        const frame = conveniences.swatch(container, pixelWidth, modelWidth);
        const diag = frame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(pixelWidth);
        expect(diag.height).toEqual(pixelWidth);
    });
    it('should create an rgba color string', () => {
        const dir1 = [255, 0, 0];
        const color1 = conveniences.rgb(dir1)
        expect(color1).toEqual('rgb(255, 128, 128)');
        const dir2 = [0, 255, 0];
        const color2 = conveniences.rgb(dir2, 0.5);
        expect(color2).toEqual('rgba(128, 255, 128, 0.5)');
        const bogusDir = [0, 0];
        expect(() => conveniences.rgb(bogusDir)).toThrow();
    });

    it('should create a cube 3d frame', () => {
        const container = document.createElement('div');
        const pixelWidth = 150;
        const modelWidth = 20;
        const modelCenter = [0, 0, 100];
        const frame3d = conveniences.cube(container, pixelWidth, modelWidth, modelCenter);
        const diag = frame3d.onFrame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(pixelWidth);
        expect(diag.height).toEqual(pixelWidth);
    });

    it ('should create a cube 3d frame with default center', () => {
        const container = document.createElement('div');
        const pixelWidth = 150;
        const modelWidth = 20;
        const frame3d = conveniences.cube(container, pixelWidth, modelWidth);
        const diag = frame3d.onFrame.diagram;
        expect(diag).toBeInstanceOf(diagram.Diagram);
        expect(diag.width).toEqual(pixelWidth);
        expect(diag.height).toEqual(pixelWidth);
    });
    it('should rotate points', () => {
        const R = new conveniences.Rotation2d(90, [3, 4])
        const start = [2, 4];
        const startT = R.transformPoint(start);
        const end = [3, 3];
        function close2d(a: tsvector.Vector, b: tsvector.Vector, tol: number=1e-6): boolean {
            expect(a.length).toEqual(2);
            expect(b.length).toEqual(2);
            const [x1, y1] = a;
            const [x2, y2] = b;
            expect(x1).toBeCloseTo(x2, 6);
            expect(y1).toBeCloseTo(y2, 6);
            return true;
        };
        close2d(startT, end);
        const endT = R.transformPoint(end);
        close2d(endT, [4,4]);
        // smoke test for canvas transform
        const container = document.createElement('div');
        const pixelWidth = 100;
        const modelWidth = 10;
        const frame = conveniences.swatch(container, pixelWidth, modelWidth);
        const ctx = frame.diagram.ctx;
        //const R = new conveniences.Rotation2d(45);
        R.applyToCanvas(ctx!);
    });

});