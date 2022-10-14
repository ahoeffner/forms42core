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

import { Class } from '../types/Class.js';
import { Block } from '../public/Block.js';
import { Alert } from '../application/Alert.js';
import { Key } from '../model/relations/Key.js';
import { Framework } from '../application/Framework.js';
import { EventType } from '../control/events/EventType.js';
import { FormsModule } from '../application/FormsModule.js';
import { FormBacking } from '../application/FormBacking.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { TriggerFunction } from '../public/TriggerFunction.js';
import { CallbackFunction } from '../public/CallbackFunction.js';
import { Canvas, View } from '../application/interfaces/Canvas.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';


/*
 * This is an exact copy of the public form. Its sole purpose is to circumvent:
 * ReferenceError: Cannot access 'Form' before initialization
 * when calling internal forms from public forms
 */

export class Form implements CanvasComponent
{
	public canvas:Canvas = null;
	public moveable:boolean = true;
	public navigable:boolean = true;
	public resizable:boolean = true;
	public parameters:Map<any,any> = new Map<any,any>();
	public blocks:Map<string,Block> = new Map<string,Block>();

	constructor(page?:string|HTMLElement)
	{
		page = Framework.prepare(page);
		FormBacking.setBacking(this).page = page;
	}

	public get name() : string
	{
		return(this.constructor.name.toLowerCase());
	}

	public focus() : void
	{
		FormBacking.getViewForm(this).focus();
	}

	public hide() : void
	{
		this.canvas.remove();
	}

	public show() : void
	{
		this.canvas.restore();
		this.focus();
	}

	public link(master:Key, detail:Key, orphanQueries?:boolean) : void
	{
		if (orphanQueries == null) orphanQueries = true;
		FormBacking.getBacking(this).setLink(master,detail, orphanQueries);
	}

	public goBlock(block:string) : void
	{
		this.getBlock(block)?.focus();
	}

	public goField(block:string, field:string, clazz?:string) : void
	{
		this.getBlock(block)?.goField(field,clazz);
	}

	public message(msg:string, title?:string) : void
	{
		Alert.message(msg,title);
	}

	public warning(msg:string, title?:string) : void
	{
		Alert.warning(msg,title);
	}

	public get valid() : boolean
	{
		if (FormBacking.getModelForm(this).eventTransaction.running() > 0)
			return(false);

		return(FormBacking.getViewForm(this).validated());
	}

	public async validate() : Promise<boolean>
	{
		return(FormBacking.getViewForm(this).validate());
	}

	public getView() : HTMLElement
	{
		let view:HTMLElement = this.canvas?.getView();
		if (view != null) return(this.canvas.getView());
		else return(FormBacking.getBacking(this).page);
	}

	public getViewPort() : View
	{
		return(this.canvas.getViewPort());
	}

	public setViewPort(view:View) : void
	{
		this.canvas.setViewPort(view);
	}

	public getParentViewPort() : View
	{
		return(this.canvas.getParentViewPort());
	}

	public getBlock(block:string) : Block
	{
		return(this.blocks.get(block?.toLowerCase()));
	}

	public setDataSource(block:string,source:DataSource) : void
	{
		FormBacking.getModelForm(this).setDataSource(block?.toLowerCase(),source);
	}

	public getValue(block:string, field:string) : any
	{
		return(this.getBlock(block)?.getValue(field));
	}

	public setValue(block:string, field:string, value:any) : void
	{
		this.getBlock(block)?.setValue(field,value);
	}

	public async flush() : Promise<boolean>
	{
		return(FormBacking.getModelForm(this).flush());
	}

	public async showform(form:Class<Form>|string, parameters?:Map<any,any>, container?:HTMLElement) : Promise<Form>
	{
		if (!await this.validate()) return(null);
		let cform:Form = await FormsModule.get().showform(form,parameters,container);
		return(cform);
	}

	public async callform(form:Class<Form>|string, parameters?:Map<any,any>, container?:HTMLElement) : Promise<Form>
	{
		this.canvas.block();

		FormBacking.getBacking(this).hasModalChild = true;
		let cform:Form = await FormsModule.get().showform(form,parameters,container);

		if (cform) FormBacking.getBacking(cform).parent = this;
		else       FormBacking.getBacking(this).hasModalChild = false;

		return(cform);
	}

	public callback(_form:Form) : CallbackFunction
	{
		return;
	}

	public async setView(page:string|HTMLElement) : Promise<void>
	{
		let back:FormBacking = FormBacking.getBacking(this);

		if (page == null)
		{
			page = "";

			if (back.page == null)
				return;
		}

		if (this.canvas != null)
		{
			if (!this.validate())
			{
				Alert.warning("Form must be validated before layout can be changed","Validate");
				return;
			}

			if (FormBacking.getBacking(this).hasEventListeners())
				console.warn("Replacing view will remove all event listeners");

			FormBacking.cleanup(this);
		}

		page = Framework.prepare(page);
		Framework.parse(this,page);
		back.page = page;

		if (this.canvas != null)
			this.canvas.replace(page);

		await FormBacking.getViewForm(this,true).finalize();
		await FormBacking.getModelForm(this,true).finalize();
	}

	public async close() : Promise<boolean>
	{
		if (!await FormBacking.getViewForm(this).validate())
			return(false);

		await FormBacking.getModelForm(this).wait4EventTransaction(EventType.OnCloseForm,null);
		let success:boolean = await FormEvents.raise(FormEvent.FormEvent(EventType.OnCloseForm,this));

		if (success)
		{
			this.canvas.close();
			let parent:Form = FormBacking.getBacking(this).parent;

			if (parent != null)
			{
				parent.focus();
				parent.canvas.unblock();

				parent.callback(this);
				FormBacking.getBacking(parent).hasModalChild = false;
			}

			FormBacking.removeBacking(this);
		}

		return(success);
	}

	public removeEventListener(handle:object) : void
	{
		FormBacking.getBacking(this).removeEventListener(handle);
	}

	public addEventListener(method:TriggerFunction, filter?:EventFilter|EventFilter[]) : object
	{
		let handle:object = FormEvents.addListener(this,this,method,filter);
		FormBacking.getBacking(this).listeners.push(handle);
		return(handle);
	}
}