import { Form } from "../Form.js";
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";



export class Loading extends Form
{
	constructor()
	{
		super(Loading.page);
		this.addEventListener(this.initialize, { type: EventType.PostViewInit });
	}

	public start(message:string) : void
	{
		console.log(document.activeElement);
		this.setValue("loading","msg",message);
	}

	private async initialize() : Promise<boolean>
	{
		Internals.stylePopupWindow(this.getView());
		return (true);
	}

	public static page:string =
	`
		<div style="width: 100%; height: 100%">
			<div name="msg" from="loading"></div>
			<div name="loading"></div>
		</div>
	`
}
