import { Properties } from "./Properties";

export class Window
{
    private layer:number = 2;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;
    private container:HTMLDivElement = null;

    constructor(component:Element)
    {
        let classes:string = null;
        let layout:string = Properties.window.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;
        this.modal = template.content.querySelector("[name=modal]");
        this.window = template.content.querySelector("[name=window]");
        this.container = template.content.querySelector("[name=page]");

        classes = this.modal.classList.value;
        this.modal.classList.value = classes + " "+Properties.window.windowClasses;

        classes = this.window.classList.value;
        this.window.classList.value = classes + " "+Properties.window.windowClasses;

        classes = this.container.classList.value;
        this.container.classList.value = classes + " "+Properties.window.windowClasses;

        this.container.appendChild(component);
        this.window.addEventListener("mousedown",(event) => {this.dragstart(event)});
    }

    public block() : void
    {
        this.window.style.resize = "none";
        this.modal.style.width = this.window.offsetWidth+"px";
        this.modal.style.height = this.window.offsetHeight+"px";
}

    public unblock() : void
    {
        this.modal.style.width = "0";
        this.modal.style.height = "0";
        this.window.style.resize = "both";
    }

    public getPage() : Element
    {
        return(this.window);
    }


    /*
     * Drag code
     */

    private move = false;
    private mouse = {x: 0, y: 0};

    private dragstart(event:any) : void
    {
        console.log("dragstart");

        //if (event.clientY - this.window.offsetTop >= 24)
        //    return;

        this.move = true;

        document.addEventListener('mousemove',(event) => {this.drag(event)});
        document.addEventListener('mouseup',(event) => {this.dragend(event)});

        this.mouse = {x: event.clientX, y: event.clientY};
    }

    private drag(event:any) : void
    {
        if (this.move)
        {
            event.preventDefault();
            var offX = event.clientX - this.mouse.x;
            var offY = event.clientY - this.mouse.y;

            var elemY = this.window.offsetTop;
            var elemX = this.window.offsetLeft;

            var posX = elemX + offX;
            var posY = elemY + offY;

            this.window.style.top = posY + "px";
            this.window.style.left = posX + "px";
            console.log("X: "+this.window.offsetLeft+" : "+this.window.offsetTop+" "+this.window.style.top)

            this.mouse = {x: event.clientX, y: event.clientY};
        }
    }

    private dragend(event:any) : void
    {
        this.move = false;
        console.log("remove");
        document.removeEventListener('mousemove',this.drag);
        document.removeEventListener('mouseup',this.dragend);
    }
}