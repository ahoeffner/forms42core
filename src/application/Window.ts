import { Properties } from "./Properties";

export class Window
{
    private layer:number = 2;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;

    constructor(component:Element)
    {
        this.modal = document.createElement("div");
        this.window = document.createElement("div");

        let page:HTMLDivElement = document.createElement("div");
        let canvas:HTMLDivElement = document.createElement("div");

        canvas.style.cssText = "position: relative;";
        page.style.cssText = "position: absolute; top: 0; left: 0;";

        this.window.setAttribute("draggable","true");
        this.window.style.cssText = Properties.window.style;
        this.modal.style.cssText = "background-color: grey; opacity: 0.2";

        this.window.style.zIndex = (this.layer)+"";
        this.modal.style.zIndex = (this.layer+1)+"";

        canvas.classList.add("canvas");
        this.modal.classList.add("modal");

        page.appendChild(component);
        canvas.appendChild(page);
        canvas.appendChild(this.modal);

        canvas.style.width = (component as HTMLDivElement).style.width+"";
        canvas.style.height = (component as HTMLDivElement).style.height+"";

        console.log("canvas: "+canvas.style.width)

        this.window.appendChild(canvas);
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