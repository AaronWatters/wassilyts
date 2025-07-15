import * as tsvector from "tsvector";
import * as styled from './styled';
//import * as frame from './frame';
import * as frame3d from './frame3d';
import * as projection from './projection';

export class Orbiter {
    frame3d: frame3d.Frame3d;
    projection: projection.Projector;
    startXY: tsvector.Vector | null = null;
    endXY: tsvector.Vector | null = null;
    originalMatrix: tsvector.Matrix | null = null;

    constructor(frame3d: frame3d.Frame3d) {
        this.frame3d = frame3d;
        this.projection = frame3d.projection;
        const onFrame = frame3d.onFrame;
        // register pointer event handlers on the onFrame
        onFrame.onEvent('pointerdown', (element, eventType, canvasXY, cartesianXY, frameXY) => {
            return this.pointerDownHandler(element, eventType, canvasXY, cartesianXY, frameXY);
        });
        onFrame.onEvent('pointermove', (element, eventType, canvasXY, cartesianXY, frameXY) => {
            return this.pointerMoveHandler(element, eventType, canvasXY, cartesianXY, frameXY);
        });
        onFrame.onEvent('pointerup', (element, eventType, canvasXY, cartesianXY, frameXY) => {
            return this.pointerUpHandler(element, eventType, canvasXY, cartesianXY, frameXY);
        });
        // if the mouse moves out of the frame use pointerup
        onFrame.onEvent('pointerout', (element, eventType, canvasXY, cartesianXY, frameXY) => {
            return this.pointerUpHandler(element, eventType, canvasXY, cartesianXY, frameXY);
        });
        // set the onFrame to be responsive
        onFrame.responsive = true;
    }

    doRotation(endXY: tsvector.Vector): void {
        // error if startXY is null
        if (this.startXY === null) {
            throw new Error("startXY is null, cannot perform rotation.");
        }
        // error if originalMatrix is null
        if (this.originalMatrix === null) {
            throw new Error("originalMatrix is null, cannot perform rotation.");
        }
        this.endXY = endXY;
        // rotate with respect to the original matrix
        this.projection.rotateXY(this.startXY, this.endXY, this.originalMatrix);
        this.frame3d.requestRedraw();
    };

    pointerDownHandler(
        element: styled.Styled | null, // element can be null in frame with no marking picked
        eventType: string,
        canvasXY: tsvector.Vector, 
        cartesianXY: tsvector.Vector, 
        frameXY: tsvector.Vector,): boolean 
    {
        // save the startXY and originalMatrix
        this.startXY = frameXY;
        this.originalMatrix = this.projection.projectionMatrix;
        // return true to indicate the event was handled
        return true;
    };

    pointerMoveHandler(
        element: styled.Styled | null,
        eventType: string,
        canvasXY: tsvector.Vector,
        cartesianXY: tsvector.Vector,
        frameXY: tsvector.Vector,
    ): boolean 
    {
        // don't handle the event if startXY is null
        if (this.startXY === null) {
            return false;
        }
        // error if originalMatrix is null
        if (this.originalMatrix === null) {
            throw new Error("originalMatrix is null, cannot perform rotation.");
        }
        this.endXY = frameXY;
        // rotate with respect to the original matrix
        this.doRotation(this.endXY);
        return true;
    }

    pointerUpHandler(
        element: styled.Styled | null,
        eventType: string,
        canvasXY: tsvector.Vector,
        cartesianXY: tsvector.Vector,
        frameXY: tsvector.Vector,
    ): boolean 
    {
        // reset the start and end points
        this.startXY = null;
        this.endXY = null;
        this.originalMatrix = null;
        return true;
    }
}