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
import { EventType } from "../../control/events/EventType.js";
import { Internals } from "../../application/properties/Internals.js";

export class UsernamePassword extends Form
{
    public title:string = null;
    public username:string = null;
    public password:string = null;
	 public accepted:boolean = false;

	constructor()
	{
		super(UsernamePassword.page);

		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
		this.addEventListener(this.cancel,{type: EventType.Key, key: KeyMap.escape});

		this.addEventListener(this.accept,
		[
			{type: EventType.Key, key:KeyMap.enter}
		]);
   }

   public async cancel(): Promise<boolean>
	{
		this.username = null;
		this.password = null;
		await this.close();
		return(false);
	}

	private async accept():Promise<boolean>
	{
		this.accepted = true;
		this.username = this.getValue("login","username");
		this.password = this.getValue("login","password");
		await this.close();
		return(false);
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
		<div name="loginimage"></div>
		<div name="login">
			<label for="username">Username</label>
			<input from="login" tabindex="0" name="username" />
			<label for="password">Password</label>
			<input type="password" tabindex="1" from="login" name="password"/>
		</div>
	</div>
	<div name="lowerright">
		<div name="buttonarea">
			<button name="login" onclick="this.accept()" tabindex="2">Login</button>
			<button name="cancel" onclick="this.cancel()" tabindex="3">Cancel</button>
		</div>
	</div>

   ` + Internals.footer
}