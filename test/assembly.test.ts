import { describe, expect, it } from 'vitest';
import {
    frame,
    diagram,
} from '../src/index';
import * as assembly from '../src/assembly';

describe('star assembly', () => {

    it('should make a star with default parameters', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 10;
        const star = frm.star(center, innerRadius);
        diag.draw();
        expect(star.numPoints).toEqual(5);
        expect(star.innerRadius).toEqual(innerRadius);
        expect(star.outerRadius).toEqual(innerRadius * 2);
        expect(star.rotationDegrees).toEqual(0);
        expect(star.getFramePoint()).toEqual(center);
    });

    it('should make a star with custom number of points', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 10;
        const numPoints = 8;
        const star = frm.star(center, innerRadius, numPoints);
        diag.draw();
        expect(star.numPoints).toEqual(numPoints);
        expect(star.innerRadius).toEqual(innerRadius);
    });

    it('should make a star with custom pointFactor', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 15;
        const numPoints = 5;
        const pointFactor = 1.5;
        const star = frm.star(center, innerRadius, numPoints, pointFactor);
        diag.draw();
        expect(star.innerRadius).toEqual(innerRadius);
        expect(star.outerRadius).toEqual(innerRadius * pointFactor);
    });

    it('should make a star with custom rotation', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [50, 50];
        const innerRadius = 10;
        const numPoints = 5;
        const pointFactor = 2;
        const degrees = 45;
        const star = frm.star(center, innerRadius, numPoints, pointFactor, degrees);
        diag.draw();
        expect(star.rotationDegrees).toEqual(degrees);
    });

    it('should update frame point on a star', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const star = frm.star([50, 50], 10);
        const newCenter = [30, 70];
        star.setFramePoint(newCenter);
        expect(star.getFramePoint()).toEqual(newCenter);
    });

    it('should create a star directly via the Star constructor', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const center = [20, 30];
        const innerRadius = 8;
        const numPoints = 6;
        const pointFactor = 1.8;
        const degrees = 30;
        const star = new assembly.Star(frm, center, innerRadius, numPoints, pointFactor, degrees);
        frm.addElement(star);
        diag.draw();
        expect(star.numPoints).toEqual(numPoints);
        expect(star.innerRadius).toEqual(innerRadius);
        expect(star.outerRadius).toEqual(innerRadius * pointFactor);
        expect(star.rotationDegrees).toEqual(degrees);
        expect(star.getFramePoint()).toEqual(center);
    });

});
