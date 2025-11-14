/*
Convenience for creating frames.
*/

import ts from 'typescript';
import * as diagram from './diagram';
import * as frame from './frame';
import * as frame3d from './frame3d';
import * as tsvector from 'tsvector' ;

/**
 * Create an rgb(...) or rgba(...) string from a vector direction.
 * @param direction The 3d vector direction.
 * @param alpha The alpha value for rgba. Default is 1.
 * @returns The rgb or rgba string.
 */
export function rgb(direction: tsvector.Vector, alpha: number | null = null, epsilon: number = 1e-6): string {
    if (direction.length !== 3) {
        throw new Error('Direction must be a 3D vector.');
    }
    const len = tsvector.vLength(direction);
    let shifted = [0.5, 0.5, 0.5];
    if (len > epsilon) {
        let halve = 0.5 / len;
        let halved = tsvector.vScale(halve, direction);
        shifted = tsvector.vAdd(halved, [0.5, 0.5, 0.5]);
    }
    const [r, g, b] = shifted.map((x) => Math.round(x * 255));
    if (alpha !== null) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
        return `rgb(${r}, ${g}, ${b})`;
    }
};

/**
 * Create a 2D frame scaled to the given coordinates.
 * @param minxy The minimum x and y coordinates of the model.
 * @param maxxy The maximum x and y coordinates of the model.
 * @param container The HTML container element, or its ID.
 * @param width The pixel width of the panel.
 * @param height The pixel height of the panel. If null, it will be match the y extent of the coordinates.
 * @returns The created panel frame.
 */
export function panel(
    container: HTMLElement | string, 
    minxy: number[], 
    maxxy: number[], 
    width: number, 
    height: number | null = null,
    epsilon: number = 1e-6
): frame.Frame {
    let element: HTMLElement;
    if (typeof container === 'string') {
        const el = document.getElementById(container);
        if (el === null) {
            throw new Error(`Container element with id ${container} not found.`);
        }
        element = el;
    } else {
        element = container;
    }
    const extent = tsvector.vSub(maxxy, minxy);
    if (Math.min(...extent) < epsilon) {
        throw new Error('The extent of the coordinates is too small to create a frame.');
    }
    if (width <= 0) {
        throw new Error('Width must be greater than zero.');
    }
    if (height === null) {
        const aspect = extent[1] / extent[0];
        height = width * aspect;
    }
    if (height <= 0) {
        throw new Error('Height must be greater than zero.');
    }
    const mainFrame = diagram.drawOn(element, width, height);
    const fromMin = [0, 0];
    const fromMax = [width, height];
    const scaledFrame = mainFrame.regionFrame(
        fromMin, fromMax, minxy, maxxy);
    return scaledFrame;
};

/**
 * Create a square panel frame with a given pixel width and model width.
 * @param container The HTML container element, or its ID.
 * @param pixelWidth The pixel width of the swatch.
 * @param modelWidth The model width of the swatch.
 * @param modelCenter The model center of the swatch. If null, it will be [0, 0].
 * @param epsilon The minimum extent for creating the frame.
 * @returns The created swatch frame.
 */
export function swatch(
    container: HTMLElement | string,
    pixelWidth: number, 
    modelWidth: number, 
    modelCenter: tsvector.Vector | null = null  ,
    epsilon: number = 1e-6
): frame.Frame {
    if (modelCenter === null) {
        modelCenter = [0, 0];
    }
    const width2 = modelWidth / 2;
    const offset = [width2, width2];
    const minxy = tsvector.vSub(modelCenter, offset);
    const maxxy = tsvector.vAdd(modelCenter, offset);
    const result = panel(
        container,
        minxy, 
        maxxy,
        pixelWidth,
        pixelWidth,
        epsilon);
    return result;
};

/**
 * Create a 3D cube frame.
 * @param container The HTML container element, or its ID.
 * @param pixelWidth The pixel width of the cube.
 * @param modelWidth The model width of the cube.
 * @param modelCenter The model center of the cube. If null, it will be [0, 0, 0].
 * @param perspective Whether to apply perspective to the cube.
 * @param epsilon The minimum extent for creating the frame.
 * @returns The created cube frame.
 */
export function cube(
    container: HTMLElement | string,
    pixelWidth: number,
    modelWidth: number,
    modelCenter: tsvector.Vector | null = null,
    perspective: boolean = true,
    shrinkFactor: number = 0.9,
    epsilon: number = 1e-6
): frame3d.Frame3d {
    if (modelCenter === null) {
        modelCenter = [0, 0, 0];
    }
    const eye_offset = [0, 0, -1.5 * modelWidth];
    const eye = tsvector.vAdd(modelCenter, eye_offset);
    //const lookAtOffset = [0, 0, -0.5 * modelWidth];
    //const lookAt = tsvector.vAdd(modelCenter, lookAtOffset);
    const lookAt = modelCenter;
    const up = [0, 1, 0];
    const swatchWidth = modelWidth * shrinkFactor;
    const onPanel = swatch(
        container,
        pixelWidth,
        swatchWidth,
        [modelCenter[0], modelCenter[1]],
        epsilon);
    const cubeFrame = onPanel.frame3d(
        eye, lookAt, perspective, up);
    return cubeFrame;
};
