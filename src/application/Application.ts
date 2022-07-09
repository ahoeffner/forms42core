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

import { Form } from '../public/Form.js';
import { Class } from '../types/Class.js';
import { Properties } from './Properties.js';
import { FormsModule } from './FormsModule.js';
import { Canvas } from './interfaces/Canvas.js';
import { Form as ModelForm } from '../model/Form.js';
import { EventType } from '../control/events/EventType.js';
import { ComponentFactory } from './interfaces/ComponentFactory.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';

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

    public async showform(form:Class<Form>|string, container?:HTMLElement) : Promise<Form>
    {
		if (typeof form === "string")
		{
			let path:string = form;
			form = form.toLowerCase();
			form = this.state.module.getComponent(form);
			if (form == null) throw "@Application: No components mapped to path '"+path+"'";
		}

        if (container == null)
			container = this.state.module.getRootElement();

		if (!(form.prototype instanceof Form))
            throw "@Application: Component mapped to '"+form+"' is not a form";

        let canvasimpl:Class<Canvas> = Properties.CanvasImplementationClass;
        let factory:ComponentFactory = Properties.FactoryImplementationClass;

        let canvas:Canvas = new canvasimpl();
        let instance:Form = factory.createForm(form);

        instance.canvas = canvas;
        canvas.setComponent(instance);
        container.appendChild(canvas.getElement());

		ModelForm.getForm(instance).setEventTransaction(EventType.FormInit);
		let success:boolean = await FormEvents.raise(FormEvent.FormEvent(EventType.FormInit,instance));
		ModelForm.getForm(instance).endEventTransaction(success);

		return(instance);
    }
}