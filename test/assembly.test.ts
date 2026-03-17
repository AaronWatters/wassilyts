import { describe, expect, it } from 'vitest';
import {
  diagram,
} from '../src/index';
import * as assembly from '../src/assembly';

describe('star assembly', () => {

    it('should create a star with default parameters', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 20;
        const star = new assembly.Star(frm, center, innerRadius);
        expect(star.numPoints).toEqual(5);
        expect(star.innerRadius).toEqual(innerRadius);
        expect(star.outerRadius).toBeCloseTo(innerRadius * 1.4);
        expect(star.rotationDegrees).toEqual(0);
        expect(star.getFramePoint()).toEqual(center);
    });

    it('should create a star with custom parameters', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [30, 40];
        const innerRadius = 10;
        const numPoints = 6;
        const pointFactor = 2.0;
        const degrees = 45;
        const star = new assembly.Star(frm, center, innerRadius, numPoints, pointFactor, degrees);
        expect(star.numPoints).toEqual(numPoints);
        expect(star.innerRadius).toEqual(innerRadius);
        expect(star.outerRadius).toBeCloseTo(innerRadius * pointFactor);
        expect(star.rotationDegrees).toEqual(degrees);
        expect(star.getFramePoint()).toEqual(center);
    });

    it('should update the star position with setFramePoint', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 15;
        const star = new assembly.Star(frm, center, innerRadius);
        const newCenter = [20, 30];
        star.setFramePoint(newCenter);
        expect(star.getFramePoint()).toEqual(newCenter);
    });

    it('should draw a star and produce diagram stats', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 20;
        const star = new assembly.Star(frm, center, innerRadius);
        diag.draw();
        expect(star.numPoints).toEqual(5);
        expect(star.innerRadius).toEqual(innerRadius);
        expect(diag.stats.minxy).toBeDefined();
        expect(diag.stats.maxxy).toBeDefined();
    });

    it('should have a dedicated assembly frame', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 10;
        const star = new assembly.Star(frm, center, innerRadius);
        expect(star.assemblyFrame).toBeDefined();
        expect(star.assemblyFrame.diagram).toBe(diag);
    });

});
