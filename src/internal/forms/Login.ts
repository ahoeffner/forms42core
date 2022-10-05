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

export class Login extends Form{


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

        this.done();
        return(true);
    }


    private async done() : Promise<boolean>
    {

        return(this.close());
    }

    private async initialize() : Promise<boolean>
    {

        return(true);
    }


    public static page: string = 
    Internals.header +
    `
    <div name="popup-body">
         <div name="login">
            <span>
                <label for="username">Username:</label>
                <input from="login" name="username"/>
            </span>
            <span>
                <label for="password">password:</label>
                <input from="login" name="password"/>
            </span>
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