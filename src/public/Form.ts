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

import { Field } from './Field.js';
import { Form as View } from '../view/Form.js';
import { Form as Model } from '../model/Form.js';
import { FieldInstance } from './FieldInstance.js';
import { Block as ViewBlock } from '../view/Block.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Framework } from '../application/Framework.js';
import { EventType } from '../control/events/EventType.js';
import { Field as ViewField } from '../view/fields/Field.js';
import { Canvas } from '../application/interfaces/Canvas.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';
import { FieldInstance as ViewInstance } from '../view/fields/FieldInstance.js';


export class Form implements CanvasComponent
{
    public canvas:Canvas = null;
    public moveable:boolean = true;
    public navigable:boolean = true;
    public resizable:boolean = true;
    private view$:HTMLElement = null;

    constructor(page?:string|HTMLElement)
    {
        if (page != null)
			this.setView(page);

		Model.getForm(this);
    }

    public getView() : HTMLElement
    {
        return(this.view$);
    }

    public setView(page:string|HTMLElement)
    {
		let replace:boolean = false;

		if (this.view$ == null)
		{
			View.getForm(this);
			Model.getForm(this);
		}
		else
		{
			replace = true;
			View.drop(this);
			Model.drop(this);
		}

        if (typeof page === 'string')
        {
            let template:HTMLDivElement = document.createElement('div');
            template.innerHTML = page;
			page = Framework.trim(template);
		}

        Framework.parse(this,page);
        this.view$ = page;

		if (replace)
			this.canvas.refresh();

		View.finalize(this);
		Model.finalize(this);
    }

	public getField(block:string, field:string) : Field
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		let fld:ViewField = View.getForm(this).getBlock(block)?.getField(field);
		if (fld != null) return(new Field(fld));
		return(null);
	}

	public getFieldInstance(id:string) : FieldInstance
	{
		return(null);
	}

	public setValue(block:string, field:string, value:any) : void
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		let blk:ViewBlock = View.getForm(this).getBlock(block);

		if (!blk.model.postquery)
			blk.getField(field)?.setValue(value);

		let mdl:ModelBlock = blk.model;
		mdl.setValue(field,value);
	}

	public getValue(block:string, field:string) : any
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		let blk:ViewBlock = View.getForm(this).getBlock(block);

		if (blk == null) return(null);

		if (!blk.model.postquery)
		{
			let fld:ViewField = blk.getField(field);
			if (fld != null) return(blk.getValue(field));
		}

		let mdl:ModelBlock = blk.model;
		return(mdl.getValue(field));
	}

    public async close() : Promise<boolean>
    {
		if (Model.getForm(this).validated)
			return(false);

		if (!await FormEvents.raise(FormEvent.newFormEvent(EventType.FormClose,this)))
			return(false);

        this.canvas.close();
        return(true);
    }

	public addEventListener(method:Function, filter?:EventFilter|EventFilter[]) : void
	{
		FormEvents.addListener(this,this,method,filter);
	}
}