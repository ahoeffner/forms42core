import { WindowComponent } from "../WindowComponent";

export interface Window
{
    block() : void;
    unblock() : void;
    getPage() : Element;
    getDepth() : number;
    setDepth(depth:number) : void;
    getComponent() : WindowComponent;
}