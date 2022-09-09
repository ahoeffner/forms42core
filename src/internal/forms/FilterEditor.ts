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
import { Properties } from "../../application/Properties.js";
import { EventType } from "../../control/events/EventType.js";
import { Popup } from "../../application/properties/Popup.js";

export class FilterEditor extends Form
{
	constructor()
	{
		super(Properties.filtereditor.page);
		this.addEventListener(this.initialize,{type: EventType.PostViewInit})
	}

	public async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();

		let header:HTMLElement = view.querySelector(".window-header");
		let footer:HTMLElement = view.querySelector(".window-footer");

		if (header) header.style.cssText = Popup.WindowHeaderStyle;
		if (footer) footer.style.cssText = Popup.WindowFooterStyle;


		this.canvas.getElement().style.top = "400px";
		this.canvas.getElement().style.left = "400px";
		this.canvas.getElement().style.width = "200px";
		this.canvas.getElement().style.height = "200px";

		return(true);
	}

}