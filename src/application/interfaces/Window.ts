import { WindowComponent } from '../WindowComponent.js';

export interface Window
{
    close() : void;
    block() : void;
    unblock() : void;
    getPage() : Element;
    getDepth() : number;
    setDepth(depth:number) : void;
    getComponent() : WindowComponent;
    setComponent(component:WindowComponent) : void;
}