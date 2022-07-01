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
import { Framework } from '../application/Framework.js';
import { EventType } from '../control/events/EventType.js';
import { Field as ViewField } from '../view/fields/Field.js';
import { Canvas } from '../application/interfaces/Canvas.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';
import { Alert } from '../application/Alert.js';


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

    public setView(page:string|HTMLElement) : void
    {
		let replace:boolean = false;

		if (this.view$ == null)
		{
			View.getForm(this);
			Model.getForm(this);
		}
		else
		{
			if (!this.valid)
			{
				Alert.warning("Form must be validated before layout can be changed","Validate");
				return;
			}

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

	public getFieldInstanceById(block:string, field:string, id:string) : FieldInstance
	{
		return(null);
	}

	public setValue(block:string, field:string, value:any) : void
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		let blk:ViewBlock = View.getForm(this).getBlock(block);

		if (blk == null) return(null);

		if (blk.model.eventTransaction)
		{
			blk.model.eventTransaction.setValue(blk,field,value);
			return;
		}

		blk.model.setValue(field,value);
		blk.getField(field)?.setValue(value);
	}

	public getValue(block:string, field:string) : any
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		let blk:ViewBlock = View.getForm(this).getBlock(block);

		if (blk == null) return(null);

		if (blk.model.eventTransaction)
			return(blk.model.eventTransaction.getValue(blk,field));

		let fld:ViewField = blk.getField(field);
		if (fld != null) return(blk.getValue(field));

		return(blk.model.getValue(field));
	}

	public get valid() : boolean
	{
		return(View.getForm(this).validated());
	}

    public async close() : Promise<boolean>
    {
		let vform:View = View.getForm(this);
		if (!vform.validated) return(false);
		let mform:Model = Model.getForm(this);

		mform.setEventTransaction(EventType.FormClose);
		await FormEvents.raise(FormEvent.FormEvent(EventType.FormClose,this));
		mform.endEventTransaction();

        this.canvas.close();
        return(true);
    }

	public addEventListener(method:Function, filter?:EventFilter|EventFilter[]) : void
	{
		FormEvents.addListener(this,this,method,filter);
	}

	public dumpFieldInstances() : void
	{
		View.getForm(this).dumpFieldInstances();
	}
}