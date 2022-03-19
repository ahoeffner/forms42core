import { CanvasComponent } from '../CanvasComponent.js';

export interface Canvas
{
    close() : void;
    block() : void;
    unblock() : void;
    getPage() : Element;
    getDepth() : number;
    setDepth(depth:number) : void;
    getComponent() : CanvasComponent;
    setComponent(component:CanvasComponent) : void;
}