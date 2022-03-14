import { Properties } from "./Properties";

export class Window
{
    private layer:number = 2;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;

    constructor(component:Element)
    {
    }

    public block() : void
    {
        this.modal.style.width = "100%";
        this.modal.style.height = "100%";
    }

    public unblock() : void
    {
        this.modal.style.width = "0";
        this.modal.style.height = "0";
    }

    public getPage() : Element
    {
        return(this.window);
    }
}