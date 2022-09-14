/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

import { Form } from "../Form.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { MouseMap } from "../../control/events/MouseMap.js";
import { EventType } from "../../control/events/EventType.js";
import { Popup } from "../../application/properties/Popup.js";

export class DatePicker extends Form
{
	constructor()
	{
		super(DatePicker.page);
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
	}

	private async done() : Promise<boolean>
	{
		console.log("date choosen")
		return(this.close());
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();
		Popup.stylePopupWindow(view);

		//build datepicker

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});
		//this.addEventListener(this.done,{type: EventType.Mouse, mouse: MouseMap.click});

		return(true);
	}

	private static page:string =
	Popup.header +
	`
		<div name="popup-body">
			Datepicker
		</div>
	`
	+ Popup.footer;

}