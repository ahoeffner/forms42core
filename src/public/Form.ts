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

import { Block } from './Block.js';
import { Form as View } from '../view/Form.js';
import { Alert } from '../application/Alert.js';
import { Form as Model } from '../model/Form.js';
import { TriggerFunction } from './TriggerFunction.js';
import { Framework } from '../application/Framework.js';
import { EventType } from '../control/events/EventType.js';
import { Canvas } from '../application/interfaces/Canvas.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';


export class Form implements CanvasComponent
{
    public canvas:Canvas = null;
    public moveable:boolean = true;
    public navigable:boolean = true;
    public resizable:boolean = true;
    private view$:HTMLElement = null;

    constructor(page?:string|HTMLElement)
    {
		Model.createForm(this,page);
    }

	public focus() : void
	{
		View.getForm(this).focus();
	}

	public get valid() : boolean
	{
		if (Model.getForm(this).eventTransaction.running() > 0)
			return(false);

		return(View.getForm(this).validated());
	}

    public getView() : HTMLElement
    {
        return(this.view$);
    }

	public getBlock(block:string) : Block
	{
		return(Model.getForm(this).getBlock(block.toLowerCase())?.getBlock());
	}

	public setDataSource(block:string,source:DataSource) : void
	{
		Model.getForm(this).setDataSource(block.toLowerCase(),source);
	}

	public getValue(block:string, field:string) : any
	{
		return(this.getBlock(block)?.getValue(field));
	}

	public setValue(block:string, field:string, value:any) : void
	{
		this.getBlock(block)?.setValue(field,value);
	}

    public async setView(page:string|HTMLElement) : Promise<void>
    {
		let replace:boolean = false;

		if (page == null)
		{
			page = "";

			if (this.view$ == null)
				return;
		}

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

    public async close() : Promise<boolean>
    {
		let vform:View = View.getForm(this);
		if (!vform.validated) return(false);
		let mform:Model = Model.getForm(this);

		await mform.wait4EventTransaction(EventType.OnCloseForm,null);
		let success:boolean = await FormEvents.raise(FormEvent.FormEvent(EventType.OnCloseForm,this));
        if (success) this.canvas.close();
        return(success);
    }

	public addEventListener(method:TriggerFunction, filter?:EventFilter|EventFilter[]) : void
	{
		FormEvents.addListener(this,this,method,filter);
	}
}