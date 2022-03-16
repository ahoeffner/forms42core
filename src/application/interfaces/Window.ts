import { WindowComponent } from "../WindowComponent";

export interface Window
{
    block() : void;
    unblock() : void;
    close() : boolean;
    getPage() : Element;
    getDepth() : number;
    setDepth(depth:number) : void;
    getComponent() : WindowComponent;
    setComponent(component:WindowComponent) : void;
}