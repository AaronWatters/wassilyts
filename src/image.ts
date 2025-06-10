import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
//import * as marking from './marking';
import * as rect from './rect';

// A simple unrotated rectangle with optional offset.
export class Image extends rect.Rectangle {
    source: HTMLImageElement
    constructor(
        source: HTMLImageElement,
        frame: frame.Frame, 
        point: tsvector.Vector, 
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = true
    ) {
        if (size === null) {
            // check that the image is loaded
            if (!source.complete) {
                throw new Error("Image not loaded, ");
            }
            size = [source.width, source.height];
        }
        super(frame, point, size, offset, scaled);
        this.source = source;
    };
};
