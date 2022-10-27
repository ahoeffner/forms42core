import { Form } from "../Form.js";
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";



export class Loading extends Form {
    constructor() {
        super(Loading.page);

        this.addEventListener(this.initialize, { type: EventType.PostViewInit });
    }

    private async stop(): Promise<boolean>
     {
        return (true);
    }

    private async start(): Promise<boolean> 
    {
        return (true);
    }

    private async initialize(): Promise<boolean> 
    {
        let msg:string = this.parameters.get("message");

        let view:HTMLElement = this.getView();
        let block:HTMLElement = view.querySelector('div[id="block"]');

        Internals.stylePopupWindow(view);

        block.style.top = "0";
		block.style.left = "0";
		block.style.position = "fixed";
		block.style.width = document.body.offsetWidth+"px";
		block.style.height = document.body.offsetHeight+"px";
		this.setValue("waiting","msg",msg);

        return (true);
    }

    public static page: string = `
    <div id="block"></div>
    <div name="popup-body">
        <div name="msg" from="waiting"></div>
        <div class="loader"></div>
    </div>
	`
}
