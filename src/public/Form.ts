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

import { Form as View } from '../view/Form.js';
import { Form as Model } from '../model/Form.js';
import { Events } from '../view/events/Events.js';
import { Framework } from '../application/Framework.js';
import { FormsModule } from '../application/FormsModule.js';
import { EventFilter } from '../view/events/EventFilter.js';
import { Canvas } from '../application/interfaces/Canvas.js';
import { CanvasComponent } from '../application/CanvasComponent.js';


class State
{
    page:HTMLElement = null;
    module:FormsModule = FormsModule.get();
}


export class Form implements CanvasComponent
{
    public canvas:Canvas = null;
    public moveable:boolean = true;
    public navigable:boolean = true;
    public resizable:boolean = true;
    private state:State = new State();

    constructor(page?:string|HTMLElement)
    {
        if (page != null)
			this.setView(page);

		Model.create(this);
    }

    public getView() : HTMLElement
    {
        return(this.state.page);
    }

    public setView(page:string|HTMLElement)
    {
		let replace:boolean = false;

		if (this.state.page == null)
		{
			View.create(this);
			Model.create(this);
		}
		else
		{
			replace = true;
			View.clear(this);
			Model.clear(this);
		}

        if (typeof page === 'string')
        {
            let template:HTMLDivElement = document.createElement('div');
            template.innerHTML = page;
			page = Framework.trim(template);
		}

        Framework.parse(this,page);
        this.state.page = page;

		if (replace)
			this.canvas.refresh();
    }

    public close() : boolean
    {
        this.canvas.close();
        return(true);
    }

	public addEventListener(method:Function|string, filter:EventFilter|EventFilter[]) : void
	{
		Events.addListener(this,this,method,filter);
	}
}