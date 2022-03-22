import { CanvasComponent } from '../CanvasComponent.js';

export interface View
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

    getElement() : Element;
    getContent() : Element;

    getView() : View;
    getParentView() : View;
    setView(view:View) : void;

    getComponent() : CanvasComponent;
    setComponent(component:CanvasComponent) : void;

    getElementById(id:string) : Element;
    getElementByName(name:string) : Element[];
}