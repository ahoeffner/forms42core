import { Properties } from "./Properties";

export class Window
{
    private layer:number = 2;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;
    private container:HTMLDivElement = null;

    constructor(component:Element)
    {
        let layout:string = Properties.window.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;
        this.window = template.content.querySelector(".window-handle");
        this.container = template.content.querySelector(".window-page-content");

        //document.importNode(this.window);
        this.container.appendChild(component);
        this.window.addEventListener("mousedown",(event) => {this.dragstart(event)});
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


    private move = false;
    private mouse = {x: 0, y: 0};

    private dragstart(event:any) : void
    {
        console.log("dragstart");
    }
}