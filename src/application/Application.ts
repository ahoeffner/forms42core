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

import { Form } from '../forms/Form.js';
import { Class } from '../types/Class.js';
import { Properties } from './Properties.js';
import { FormsModule } from './FormsModule.js';
import { Canvas } from './interfaces/Canvas.js';
import { EventType } from '../events/EventType.js';
import { Event, Events } from '../events/Events.js';
import { ComponentFactory } from './interfaces/ComponentFactory.js';

class State
{
    module:FormsModule;
}

export class Application
{
    private state:State = new State();

    constructor(module:FormsModule)
    {
        this.state.module = module;
    }

    public showform(path:string, parent?:HTMLElement) : void
    {
        path = path.toLowerCase();
        let comp:Class<any> = this.state.module.getComponent(path);
        if (parent == null) parent = this.state.module.getRootElement();

        let canvasimpl:Class<Canvas> = Properties.CanvasImplementationClass;
        let factory:ComponentFactory = Properties.FactoryImplementationClass;

        if (parent == null)
            throw "@Application: Nowhere to place form '"+path+"'";

        if (comp == null)
            throw "@Application: No components mapped to path '"+path+"'";

        if (!(comp.prototype instanceof Form))
            throw "@Application: Component mapped to '"+path+"' is not a form";

        let canvas:Canvas = new canvasimpl();
        let form:Form = factory.createForm(comp);

        form.canvas = canvas;
        canvas.setComponent(form);
        parent.appendChild(canvas.getElement());
		Events.raise(Event.newFormEvent(EventType.NewForm,form));
    }
}