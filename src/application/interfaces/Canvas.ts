import { CanvasComponent } from '../CanvasComponent.js';

export interface Frame
{
    x       : string|number;
    y       : string|number;
    width   : string|number;
    height  : string|number;
}

export interface Canvas
{
    close() : void;

    block() : void;
    unblock() : void;

    getPage() : Element;

    getFrame() : Frame;
    getParentFrame() : Frame;
    setFrame(frame:Frame) : void;

    getDepth() : number;
    setDepth(depth:number) : void;

    getComponent() : CanvasComponent;
    setComponent(component:CanvasComponent) : void;
}