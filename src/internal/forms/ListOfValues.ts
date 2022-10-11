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

		let page:string = ListOfValues.page;
		page = page.replace("ROWS",this.props$.rows+"");

		await this.setView(page);
		let view:HTMLElement = this.getView();
		Internals.stylePopupWindow(view,"List of Values");


		this.results = this.getBlock("results");
		this.results.datasource = this.props$.datasource;
		this.addEventListener(this.onFetch,{type: EventType.OnFetch, block: "results"});

		this.results.executeQuery();
		return(true);
	}

	private async onFetch() : Promise<boolean>
	{
		let fn:string = this.results.getValue("first_name");
		this.results.setValue("display",fn);
		return(true);
	}

	public static page:string =
	Internals.header +
	`
	<div name="popup-body">
		<div name="search">
			<div><input style="margin-bottom: 15px" size=20 name="search" from="search"></div>
			<div name="results">
				<div name="row" foreach="row in 0..ROWS">
					<input name="display" from="results" row="$row" readonly>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}