import * as tsvector from 'tsvector';
//import * as diagram from './diagram';
import * as frame from './frame';
//import * as marking from './marking';
import * as rect from './rect';

// A simple unrotated rectangle with optional offset.
// Always draws the whole image, scaling to fit the rectangle.
export class Image extends rect.Rectangle {
    source: HTMLImageElement;
    awaitingLoad: boolean = false;
    constructor(
        source: HTMLImageElement,
        frame: frame.Frame, 
        point: tsvector.Vector, 
        size: tsvector.Vector | null = null,
        offset: tsvector.Vector = [0, 0],
        scaled: boolean = false
    ) {
        debugger;
        super(frame, point, size, offset, scaled);
        this.source = source;
        this.checkCompletion(source);
    };
    async checkCompletion(image: HTMLImageElement): Promise<void> {
        if (image.complete && image.naturalWidth !== 0) {
            if (this.size === null) {
                this.size = [image.naturalWidth, image.naturalHeight];
            }
        } else {
            this.awaitingLoad = true;
            return new Promise((resolve, reject) => {
                image.onload = () => {
                    if (this.size === null) {
                        this.size = [image.naturalWidth, image.naturalHeight];
                    }
                    if (this.awaitingLoad) {
                        this.awaitingLoad = false;
                        this.requestRedraw();
                    }
                    resolve();
                };
                image.onerror = () => {
                    reject(new Error("Failed to load image."));
                };
            });
        }
    };
    drawPath(): Path2D {
        if (!this.isLive()) {
            throw new Error("Image is not attached to a frame.");
        }
        if (this.size === null) {
            this.awaitingLoad = true;
            return new Path2D(); // empty path
        }
        // otherwise just use the rectangle path
        return super.drawPath();
    };
    // override draw to draw the image
    draw() {
        if (!this.isLive()) {
            return;
        }
        if (this.size === null) {
            this.awaitingLoad = true;
            return; // image not loaded yet
        }
        debugger;
        const prep = this.prepare();
        const frame = this.onFrame!;
        const ctx = frame.diagram.ctx!;
        // get the rectangle pixel coordinates
        let pixelStart: tsvector.Vector;
        let pixelSize: tsvector.Vector;
        ({pixelStart, pixelSize} = this.getPixelStartAndSize());
        const [px, py] = pixelStart;
        const [pw, ph] = pixelSize;
        const [cx, cy] = [px, frame.diagram.canvas.height - py];
        const imagey = cy - ph;
        ctx.drawImage(this.source, cx, imagey, pw, ph);
    };
}
