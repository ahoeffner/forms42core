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
import { Block } from "../../public/Block.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";
import { ListOfValues as Lov } from "../../application/interfaces/ListOfValues.js";
import { ListOfValues as Properties } from "../../application/properties/ListOfValues.js";


export class ListOfValues extends Form implements Lov
{
	private last:string = "";
	private results:Block = null;
	private columns:string[] = null;
	private props:Properties = null;
	private cancelled:boolean = true;

	public static DELAY:number = 200;

	constructor()
	{
		super("");
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
	}

	public set properties(props:Properties)
	{
		this.props = props;
		this.initialize();
	}

	public accepted() : boolean
	{
		return(!this.cancelled);
	}

	private async done() : Promise<boolean>
	{
		this.cancelled = false;
		console.log(this.results.getValue("display"));
		return(this.close());
	}

	private async onKeyStroke() : Promise<boolean>
	{
		let search:string = this.getValue("filter","search");
		setTimeout(() => {this.query(search)},ListOfValues.DELAY);
		return(true);
	}

	private query(flt:string) : void
	{
		if (flt != this.last)
		{
			this.last = flt;

			if (this.props.filter.query(flt))
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
		if (this.props == null)
			return(true);

		let css:string = this.props.cssclass;
		let page:string = ListOfValues.page;

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

		if (this.props.filter.query(this.last))
			this.results.executeQuery();

		return(true);
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