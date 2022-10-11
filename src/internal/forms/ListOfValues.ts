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
import { Alert } from "../../application/Alert.js";
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";
import { ListOfValues as Lov } from "../../application/interfaces/ListOfValues.js";
import { ListOfValues as Properties } from "../../application/properties/ListOfValues.js";


export class ListOfValues extends Form implements Lov
{
	private props$:Properties;

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
		console.log("Lov")
		if (this.props$ == null)
			return(true);

		await this.setView(ListOfValues.page);
		let view:HTMLElement = this.getView();
		Internals.stylePopupWindow(view,"List of Values");
		return(true);
	}

	public static page:string =
	Internals.header +
	`
	<div name="popup-body">
		<div name="search">
			<div><input name="search" from="search"></div>
			<div name="results">
				<div name="row" foreach="row in 0..10">
					<input name="display" from="results" readonly>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}