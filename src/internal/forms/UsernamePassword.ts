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
import { Internals } from "../../application/properties/Internals.js";

export class UsernamePassword extends Form
{
    public title:string = null;
    public username:string = null;
    public password:string = null;

	constructor()
	{
		super(UsernamePassword.page);

		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

		this.addEventListener(this.setUsrPwd,
		[
			{type: EventType.Mouse,field:"ok", mouse:MouseMap.click},
			{type: EventType.Key, key:KeyMap.enter}
		]);

		this.addEventListener(this.cancel,
		[
			{type:EventType.Key, field:"close", key: KeyMap.enter},
			{type:EventType.Mouse, field:"close", mouse:MouseMap.click}
		]);
   }

	public async cancel(): Promise<boolean>
	{
		return(this.close());
	}

	public accepted() : boolean
	{
		console.log(this.username,this.password)
		return(false);
	}

	private async setUsrPwd():Promise<boolean>
	{
		this.username = this.getValue("login","username");
		this.password = this.getValue("login","password");

		this.accepted();
		return(true);
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();

		this.setValue("login","username",this.username);
		this.setValue("login","password",this.password);

		if (this.title == null)
			this.title = "Login";

		Internals.stylePopupWindow(view,this.title);
		return(true);
	}

	public static page: string =
	Internals.header +
	`
    <div name="popup-body">
		<div name="login">
			<label for="username">Username</label>
			<input from="login" tabindex="0" name="username" size="11"/>
			<label for="password">Password</label>
			<input type="password" tabindex="1" from="login" name="password" size="11"/>
		</div>
		<div name="lowerright">
			<div name="buttonarea">
					<button  name="close" tabindex="2">Cancel</button>
					<button name="ok" tabindex="3">Ok</button>
			</div>
		</div>
	</div>
   ` + Internals.footer
}