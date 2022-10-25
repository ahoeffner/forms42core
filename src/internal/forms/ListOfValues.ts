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
import { Case } from "../../public/Case.js";
import { Block } from "../../public/Block.js";
import { Alert } from "../../application/Alert.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { MouseMap } from "../../control/events/MouseMap.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";
import { ListOfValues as Properties } from "../../public/ListOfValues.js";


export class ListOfValues extends Form
{
	private form:Form = null;
	private last:string = null;
	private block:string = null;
	private results:Block = null;
	private columns:string[] = null;
	private props:Properties = null;
	private cancelled:boolean = true;

	public static DELAY:number = 300;

	constructor()
	{
		super("");
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
	}

	public accepted() : boolean
	{
		return(!this.cancelled);
	}

	private async done() : Promise<boolean>
	{
		this.cancelled = false;

		let source:string|string[] = this.props.sourcefields;
		let target:string|string[] = this.props.targetfields;

		if (this.form && this.block && source && target)
		{
			if (!Array.isArray(source))
				source = [source];

			if (!Array.isArray(target))
				target = [target];

			for (let i = 0; i < source.length && i < target.length; i++)
			{
				let value:any = this.results.getValue(source[i]);
				this.form.setValue(this.block,target[i],value);
			}
		}

		return(this.close());
	}

	private async onKeyStroke() : Promise<boolean>
	{
		setTimeout(() => {this.query()},ListOfValues.DELAY);
		return(true);
	}

	private query() : void
	{
		let flt:string = this.getValue("filter","search");
		if (flt == null) flt = "";

		if (flt.length < this.props.filterMinLength)
			return;

		if (flt != this.last)
		{
			this.last = flt;

			switch(this.props.filterCase)
			{
				case Case.upper: 		flt = flt?.toLocaleUpperCase(); 	break;
				case Case.lower: 		flt = flt?.toLocaleLowerCase(); 	break;
				case Case.initcap: 	flt = this.initcap(flt); 			break;
			}

			if (this.props.filterPrefix)
				flt = this.props.filterPrefix+flt;

			if (this.props.filterPostfix)
				flt += this.props.filterPostfix;

			if (this.props.filter)
			{
				if (!Array.isArray(this.props.filter)) this.props.filter = [this.props.filter];
				this.props.filter.forEach((filter) => {filter.constraint = flt});
			}

			if (this.props.bindvalue)
			{
				if (!Array.isArray(this.props.bindvalue)) this.props.bindvalue = [this.props.bindvalue];
				this.props.bindvalue.forEach((bindvalue) => {bindvalue.value = flt});
			}

			this.results.executeQuery();
		}
	}

	private async navigate(event:FormEvent) : Promise<boolean>
	{
		if (event.block == "results") this.goBlock("filter");
		else 									this.goBlock("results");

		return(false);
	}

	private async onFetch() : Promise<boolean>
	{
		let display:string = "";

		for (let i = 0; i < this.columns.length; i++)
		{
			if (i > 0) display += " ";
			display += this.results.getValue(this.columns[i]);
		}

		this.results.setValue("display",display);
		return(true);
	}

	private async initialize() : Promise<boolean>
	{
		this.form = this.parameters.get("form");
		this.block = this.parameters.get("block");
		this.props = this.parameters.get("properties");

		if (this.props == null)
		{
			Alert.fatal("No ListOfValues properties passed","List Of Values");
			return(true);
		}

		if (this.props.datasource == null)
		{
			Alert.fatal("No datasource defined in ListOfValues","List Of Values");
			return(true);
		}

		if (this.props.displayfields == null)
		{
			Alert.fatal("No display fields defined in ListOfValues","List Of Values");
			return(true);
		}

		if (this.props.rows == null)
			this.props.rows = 8;

		if (this.props.filterMinLength == null)
			this.props.filterMinLength = 0;

		if (this.props.filter)
		{
			if (!Array.isArray(this.props.filter)) this.props.filter = [this.props.filter];
			this.props.filter.forEach((filter) => {this.props.datasource.addFilter(filter)})
		}

		this.props.datasource.addColumns(this.props.sourcefields);
		this.props.datasource.addColumns(this.props.displayfields);

		let page:string = ListOfValues.page;
		let css:string = this.props.cssclass;

		page = page.replace("CSS",css ? css : "lov");
		page = page.replace("ROWS",this.props.rows+"");

		await this.setView(page);
		let view:HTMLElement = this.getView();
		Internals.stylePopupWindow(view,this.props.title);

		this.goField("filter","search");
		this.results = this.getBlock("results");

		this.addListeners();

		this.results.qbeallowed = false;
		this.results.datasource = this.props.datasource;
		let cols:string|string[] = this.props.displayfields;

		if (Array.isArray(cols)) this.columns = cols;
		else 							 this.columns = [cols];

		this.setValue("filter","search",this.form.getValue(this.block,this.props.filterInitialValueFrom)+"");

		this.query();
		return(true);
	}

	private initcap(str:string) : string
	{
		let cap:boolean = true;
		let initcap:string = "";

		for (let i = 0; i < str.length; i++)
		{
			if (cap) initcap += str.charAt(i).toLocaleUpperCase();
			else initcap += str.charAt(i).toLocaleLowerCase();

			cap = false;

			if (str.charAt(i) == ' ')
				cap = true;
		}

		return(initcap);
	}

	private addListeners() : void
	{
		this.addEventListener(this.navigate,
		[
			{type: EventType.Key, key: KeyMap.nextfield},
			{type: EventType.Key, key: KeyMap.prevfield}
		]);

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});
		this.addEventListener(this.done,{type: EventType.Mouse, mouse: MouseMap.dblclick});

		this.addEventListener(this.onFetch,{type: EventType.OnFetch, block: "results"});
		this.addEventListener(this.onKeyStroke,{type: EventType.OnEdit, block: "filter"});
	}

	public static page:string =
	Internals.header +
	`
	<div name="popup-body">
		<div name="lov" class="CSS">
			<div><input style="margin-bottom: 15px" size=20 name="search" from="filter"></div>
			<div name="results">
				<div name="row" foreach="row in 1..ROWS">
					<input name="display" from="results" row="$row" readonly derived>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}