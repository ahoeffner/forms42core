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

import { Form } from "../forms/Form";
import { Class } from "../types/Class";
import { Properties } from "./Properties";
import { FormsModule } from "./FormModule";
import { Window } from "./interfaces/Window";
import { WindowManager } from "./WindowManager";
import { ComponentFactory } from "./interfaces/ComponentFactory";

class State
{
    module:FormsModule;
    winmgr:WindowManager = new WindowManager();
}

export class Application
{
    private state:State = new State();

    constructor(module:FormsModule)
    {
        this.state.module = module;
    }

    public showform(path:string, parent?:Element) : void
    {
        path = path.toLowerCase();
        let comp:Class<any> = this.state.module.getComponent(path);
        if (parent == null) parent = this.state.module.getRootElement();

        let factory:ComponentFactory = Properties.FactoryImpl;
        let winimpl:Class<Window> = Properties.WindowImplClass;

        if (comp == null)
            throw "No components mapped to path '"+path+"'";

        if (!(comp.prototype instanceof Form))
            throw "Component mapped to '"+path+"' is not a form";

        let window:Window = new winimpl();
        let form:Form = factory.createForm(comp);

        form.window = window;
        window.setComponent(form);
        this.state.winmgr.add(null,window);
        parent.appendChild(window.getPage());
    }

}