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
import { MouseMap } from "../../control/events/MouseMap.js";
import { FormEvent } from "../../control/events/FormEvents.js";
import { Internals } from "../../application/properties/Internals.js";
import { Login as Properties } from "../../application/properties/Login.js";

export class Login extends Form
{

    username:string = null;
    password:string = null;

    constructor(){
        super(Login.page);

        this.addEventListener(this.initialize,{type: EventType.PostViewInit});

        this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

        this.addEventListener(this.setLogin,[
			{type: EventType.Key, field: "done", key:KeyMap.enter},
			{type: EventType.Mouse, mouse:MouseMap.click}
		]);

    }

    private async setLogin():Promise<boolean>
    {
     
        this.username = this.getValue("login","username");
        this.password = this.getValue("login","password");
        console.log(this.username,this.password)
        this.done();
        return(true);
    }

    private async done() : Promise<boolean>
    {

        return(this.close());
    }

    private async initialize() : Promise<boolean>
    {
        let view:HTMLElement = this.getView();

		Properties.styleLogin(view);
		Internals.stylePopupWindow(view);

        return(true);
    }

    public static page: string = 
    Internals.header +
    `
    <div name="popup-body">
         <div name="login">
            <div>
                <label for="username">Username:</label>
                <input from="login" name="username"/>
            </div>
            <div>
                <label for="password">password:</label>
                <input from="login" name="password"/>
            </div>
            <div name="lowerright">
                <div name="buttonarea">
                    <button name="close" onClick="this.close()">cancel</button>
                    <button name="done" onClick="this.setLogin()">Ok</button>
                </div>
            </div>
         </div>
    </div>

    ` + Internals.footer
}