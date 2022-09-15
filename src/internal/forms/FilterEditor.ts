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
	private type:string = null;
	private incl:boolean = false;

	private values:Block = null;
	private options:Block = null;

	private fltprops:FieldProperties = null;
	private inclprops:FieldProperties = null;

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
		this.type = this.options.getValue("options");

		if ([":","<",">"].includes(this.type))
			this.incl = this.options.getValue("include");

		if (this.type == "<" || this.type == ">")
		{
			this.hideAll();
			this.showSingle();
		}

		return(true);
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();

		this.values = this.getBlock("values");
		this.options = this.getBlock("options");

		this.setOptions();
		Popup.stylePopupWindow(view);

		this.fltprops = this.options.getDefaultPropertiesByClass("filter","single-value")
		this.inclprops = this.options.getDefaultPropertiesByClass("include","single-value")

		this.fltprops.setHidden(true).removeClass("single-value");
		this.inclprops.setHidden(true).removeClass("single-value");

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});
		this.addEventListener(this.setType,{type: EventType.PostValidateField, block: "options"});

		this.hideAll();
		return(true);
	}

	private showSingle() : void
	{
		let view:HTMLElement = this.getView();
		let single:HTMLElement = view.querySelector('div[name="single-value"]');

		single.style.display = "inline-flex";

		this.fltprops.setHidden(false);
		this.inclprops.setHidden(false);

		this.fltprops.setClass("single-value");
		this.inclprops.setClass("single-value");

		this.options.setDefaultProperties(this.fltprops,"filter","single-value");
		this.options.setDefaultProperties(this.inclprops,"include","single-value");

		this.fltprops.setHidden(true);
		this.inclprops.setHidden(true);

		this.fltprops.removeClass("single-value");
		this.inclprops.removeClass("single-value");
	}

	private hideAll() : void
	{
		let view:HTMLElement = this.getView();

		let multi:HTMLElement = view.querySelector('div[name="multi-value"]');
		let single:HTMLElement = view.querySelector('div[name="single-value"]');
		let double:HTMLElement = view.querySelector('div[name="double-value"]');

		multi.style.display = "none";
		single.style.display = "none";
		double.style.display = "none";

		this.fltprops.setClass("single-value");
		this.inclprops.setClass("single-value");

		this.options.setDefaultProperties(this.fltprops,"filter","single-value");
		this.options.setDefaultProperties(this.inclprops,"include","single-value");

		this.fltprops.removeClass("single-value");
		this.inclprops.removeClass("single-value");

		this.fltprops.setClass("double-value");
		this.inclprops.setClass("double-value");

		this.options.setDefaultProperties(this.fltprops,"range1","double-value");
		this.options.setDefaultProperties(this.fltprops,"range2","double-value");
		this.options.setDefaultProperties(this.inclprops,"include","double-value");

		this.fltprops.removeClass("double-value");
		this.inclprops.removeClass("double-value");

		this.fltprops.setClasses("multi-value");
		this.inclprops.setClasses("multi-value");
	}

	private static page:string =
		Popup.header +
		`
			<div name="popup-body">

				<div>
					<label for="options">Type :</label>
					<select id="options" name="options" from="options"></select>
					<span style="display: block; width: 1em"></span>
				</div>

				<div name="single-value">
					<label for="filter">Value :</label>
					<input id="filter" name="filter" from="options" class="single-value">

					<span style="display: block; width: 1em"></span>

					<label for="include">Incl :</label>
					<input type="checkbox" id="include1" name="include" from="options" boolean value="true" class="single-value">
				</div>

				<div name="double-value">
					<label for="filter">Values :</label>
					<input id="filter" name="range1" from="options" class="double-value">
					<input id="filter" name="range2" from="options" class="double-value">

					<span style="display: block; width: 1em"></span>

					<label for="include">Incl :</label>
					<input type="checkbox" id="include2" name="include" from="options" boolean value="true" class="double-value">
				</div>

				<div name="multi-value">
					<input name="value" from="values" row="0">
					<input name="value" from="values" row="1">
					<input name="value" from="values" row="2">
				</div>

		</div>
		`
		+ Popup.footer;
}