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
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";
import { ListOfValues as Lov } from "../../application/interfaces/ListOfValues.js";
import { ListOfValues as Properties } from "../../application/properties/ListOfValues.js";


export class ListOfValues extends Form implements Lov
{
	private results:Block = null;
	private columns:string[] = null;
	private props$:Properties = null;

	constructor()
	{
		super("");
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
	}

	public set properties(props:Properties)
	{
		this.props$ = props;
		this.initialize();
	}

	private async initialize() : Promise<boolean>
	{
		if (this.props$ == null)
			return(true);

		let css:string = this.props$.cssclass;
		let page:string = ListOfValues.page;

		page = page.replace("CSS",css ? css : "lov");
		page = page.replace("ROWS",this.props$.rows+"");

		await this.setView(page);
		let view:HTMLElement = this.getView();
		Internals.stylePopupWindow(view,this.props$.title);

		this.goField("search","search");
		this.results = this.getBlock("results");
		this.addEventListener(this.onFetch,{type: EventType.OnFetch, block: "results"});

		this.results.qbeallowed = false;
		this.results.datasource = this.props$.datasource;
		let cols:string|string[] = this.props$.displayfields;

		if (Array.isArray(cols)) this.columns = cols;
		else 							 this.columns = [cols];


		if (this.props$.autoquery)
			this.results.executeQuery();

		return(true);
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

	public static page:string =
	Internals.header +
	`
	<div name="popup-body">
		<div name="lov" class="CSS">
			<div><input style="margin-bottom: 15px" size=20 name="search" from="search"></div>
			<div name="results">
				<div name="row" foreach="row in 1..ROWS">
					<input name="display" from="results" row="$row" readonly>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}