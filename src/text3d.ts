
import * as frame3d from './frame3d';
import * as rect3d from './rect3d';
import * as tsvector from "tsvector";
import * as marking from './marking';

export class TextBox3d extends rect3d.Rect3d {

    text: string;
    alignment: CanvasTextAlign;
    background: string | null;
    shift: tsvector.Vector;

    constructor(
        text: string,
        point: tsvector.Vector,
        shift: tsvector.Vector = [0, 0],
        alignment: CanvasTextAlign = "left",
        background: string | null = null,
        onFrame3d: frame3d.Frame3d,
    ) {
        const dummyoffset = [0, 0];
        super(point, null, dummyoffset, onFrame3d, false, 0)
        this.text = text;
        this.alignment = alignment;
        this.background = background;
        this.shift = shift;
    };

    projectTo2D(): marking.Marking {
        const { point2d, size, offset } = this.geometry2d();
        const textbox2d = this.onFrame!.textBox(
            point2d,
            this.text,
            offset,
            this.alignment,
            this.background,
        );
        textbox2d.styleLike(this);
        return textbox2d;
    };
};