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
import { KeyMap } from "../../../index.js";
import { Block } from "../../public/Block.js";
import { Record } from "../../public/Record.js";
import { EventType } from "../../control/events/EventType.js";
import { Popup } from "../../application/properties/Popup.js";
import { FieldProperties } from "../../public/FieldProperties.js";

export class FilterEditor extends Form
{
	private options:Block = null;

	constructor()
	{
		super(FilterEditor.page);
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
	}

	private async done() : Promise<boolean>
	{
		console.log("create filter")
		return(this.close());
	}

	private setOptions() : void
	{
		let rec:Record = this.options.getRecord();
		let opts:FieldProperties = rec.getProperties();

		let types:Map<string,string> = new Map<string,string>();

		types.set("x","Is null");
		types.set("..","Any off");
		types.set(":","Between");
		types.set("<","Less than");
		types.set(">","Greater than");

		opts.setValidValues(types);
		rec.setProperties(opts,"options");
	}

	private async setType() : Promise<boolean>
	{
		let incl:boolean = true;
		let type:string = this.options.getValue("options");

		if ([":","<",">"].includes(type))
			incl = this.options.getValue("include");

		if (type == "<" || type == ">")
		{
			await this.validate();
			await this.setView(FilterEditor.ltgt);

			await this.initialize();

			this.options.setValue("options",type);
			this.options.setValue("include",incl);
		}

		return(true);
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();
		this.options = this.getBlock("options");

		this.canvas.getView().style.top = "400px";
		this.canvas.getView().style.left = "400px";

		this.setOptions();
		Popup.stylePopupWindow(view);

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});
		this.addEventListener(this.setType,{type: EventType.PostValidateField, block: "options"});

		return(true);
	}

	private static page:string =
		Popup.header +
		`
			<div name="popup-body">

			<div>
				<label for="options">Filter</label>
				<select id="options" name="options" from="options"></select>
			</div>

		</div>
		`
		+ Popup.footer;



	private static ltgt:string =
	Popup.header +
	`
		<div name="popup-body">

		<div>
			<label for="options">Type</label>
			<select id="options" name="options" from="options"></select>
		</div>

		<div>
			<label for="filter">Value</label>
			<input id="filter" name="filter" from="values">

			<span style="display: block; width: 3em"></span>

			<label for="include">Incl</label>
			<input type="checkbox" id="include" name="include" from="options" boolean value="true">
		</div>

	</div>
	`
	+ Popup.footer;

}