import { Properties } from "./Properties";

export class Window
{
    private layer:number = 2;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;
    private content:HTMLDivElement = null;

    constructor(component:Element)
    {
        let layout:string = Properties.window.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;

        this.modal = template.content.querySelector("[name=modal]");
        this.window = template.content.querySelector("[name=window]");
        this.content = template.content.querySelector("[name=content]");

        this.modal.classList.value = Properties.window.modalClasses;
        this.window.classList.value = Properties.window.windowClasses;
        this.content.classList.value = Properties.window.contentClasses;

        this.modal.style.cssText = Properties.window.modalStyle;
        this.window.style.cssText = Properties.window.windowStyle;
        this.content.style.cssText = Properties.window.contentStyle;

        this.content.appendChild(component);
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
    private draglsnr:lsnr = new lsnr(this,"drag");
    private dragendlsnr:lsnr = new lsnr(this,"dragend");

    private dragstart(event:any) : void
    {
        console.log("dragstart");

        //if (event.clientY - this.window.offsetTop >= 24)
        //    return;

        this.move = true;

        document.addEventListener('mousemove',this.draglsnr);
        document.addEventListener('mouseup',this.dragendlsnr);

        this.mouse = {x: event.clientX, y: event.clientY};
    }

    public drag(event:any) : void
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
        document.removeEventListener('mousemove',this.draglsnr);
        document.removeEventListener('mouseup',this.dragendlsnr);
    }
}


class lsnr implements EventListenerObject
{
    constructor(private win:Window, private func:string) {}
    handleEvent(event: Event): void {this.win[this.func](event)}
}