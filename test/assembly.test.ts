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

describe('arrow assembly', () => {

    it('should make an arrow with default parameters', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [10, 10];
        const tip = [90, 10];
        const arrow = frm.arrow(back, tip);
        diag.draw();
        expect(arrow.back).toEqual(back);
        expect(arrow.tip).toEqual(tip);
        expect(arrow.tipDegrees).toEqual(30);
        expect(arrow.tipLength).toEqual(null);
        expect(arrow.tipFactor).toEqual(0.1);
        expect(arrow.getFramePoint()).toEqual(back);
    });

    it('should make an arrow with custom tipDegrees', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [10, 10];
        const tip = [90, 10];
        const tipDegrees = 45;
        const arrow = frm.arrow(back, tip, tipDegrees);
        diag.draw();
        expect(arrow.tipDegrees).toEqual(tipDegrees);
    });

    it('should make an arrow with a fixed tipLength', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [10, 10];
        const tip = [90, 10];
        const tipLength = 20;
        const arrow = frm.arrow(back, tip, 30, tipLength);
        diag.draw();
        expect(arrow.tipLength).toEqual(tipLength);
    });

    it('should make an arrow with a custom tipFactor when tipLength is null', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [10, 10];
        const tip = [90, 10];
        const tipFactor = 0.2;
        const arrow = frm.arrow(back, tip, 30, null, tipFactor);
        diag.draw();
        expect(arrow.tipLength).toEqual(null);
        expect(arrow.tipFactor).toEqual(tipFactor);
    });

    it('should use the back point as the frame point', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [20, 30];
        const tip = [80, 70];
        const arrow = frm.arrow(back, tip);
        expect(arrow.getFramePoint()).toEqual(back);
    });

    it('should update frame point on an arrow', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const arrow = frm.arrow([10, 10], [90, 10]);
        const newBack = [30, 40];
        arrow.setFramePoint(newBack);
        expect(arrow.getFramePoint()).toEqual(newBack);
    });

    it('should create an arrow directly via the Arrow constructor', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const back = [5, 5];
        const tip = [95, 5];
        const tipLength = 15;
        const tipDegrees = 25;
        const tipFactor = 0.15;
        const arrow = new assembly.Arrow(frm, back, tip, tipLength, tipDegrees, tipFactor);
        frm.addElement(arrow);
        diag.draw();
        expect(arrow.back).toEqual(back);
        expect(arrow.tip).toEqual(tip);
        expect(arrow.tipLength).toEqual(tipLength);
        expect(arrow.tipDegrees).toEqual(tipDegrees);
        expect(arrow.tipFactor).toEqual(tipFactor);
        expect(arrow.getFramePoint()).toEqual(back);
    });

    it('should not throw when the arrow has zero length', () => {
        const container = document.createElement('div');
        const width = 100;
        const height = 100;
        const diag = new diagram.Diagram(container, width, height);
        const frm = diag.mainFrame;
        const point = [50, 50];
        const arrow = frm.arrow(point, point);
        expect(() => diag.draw()).not.toThrow();
    });

});
