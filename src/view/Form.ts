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
import { Field } from './fields/Field.js';
import { Form as ModelForm } from '../model/Form.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Logger, Type } from '../application/Logger.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { FieldInstance } from './fields/FieldInstance.js';
import { EventType } from '../../index.js';
import { Row } from './Row.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';

export class Form
{
	private static views:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	private instances:Map<HTMLElement,FieldInstance> =
		new Map<HTMLElement,FieldInstance>();

	public static drop(parent:InterfaceForm) : void
	{
		Form.views.delete(parent);
		Form.getForm(parent);
	}

	public static getForm(parent:InterfaceForm) : Form
	{
		let frm:Form = Form.views.get(parent);

		if (frm == null)
			frm = new Form(parent);

		return(frm);
	}

	public static finalize(parent:InterfaceForm) : void
	{
		let form:Form = Form.views.get(parent);
		form.blocks.forEach((blk) => {blk.finalize();});
		form.linkModels();
	}

	private block$:Block = null;
	private mdlfrm$:ModelForm = null;
	private parent$:InterfaceForm = null;
	private currfld$:FieldInstance = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:InterfaceForm)
	{
		this.parent$ = parent;
		Form.views.set(parent,this);
		Logger.log(Type.formbinding,"Create viewform: "+this.parent$.constructor.name);
	}

	public get parent() : InterfaceForm
	{
		return(this.parent$);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public getField(block:string, field:string) : Field
	{
		return(this.getBlock(block)?.getField(field));
	}

	public addInstance(instance:FieldInstance) : void
	{
		this.instances.set(instance.element,instance);
	}

	public getInstance(elem:HTMLElement) : FieldInstance
	{
		let inst:FieldInstance = this.instances.get(elem);
		let block:Block = inst.field.block;

		if (inst.row >= 0 && inst.row != block.getCurrentRow().rownum)
		{
			let entry:number = inst.field.getInstanceEntry(inst);
			let field:Field = block.getCurrentRow().getField(inst.name);
			inst = field.getInstance(entry);
		}

		return(inst);
	}

	public deleteInstance(instance:FieldInstance) : void
	{
		this.instances.delete(instance.element);
	}

	public reindexInstance(fr:HTMLElement, instance:FieldInstance) : void
	{
		this.instances.delete(fr);
		this.addInstance(instance);
	}

	public async setField(inst:FieldInstance) : Promise<boolean>
	{
		let nrow:Row = inst.field.row;
		let nblock:ModelBlock = inst.field.mdlblock;

		if (this.currfld$ == null)
		{
			this.currfld$ = inst;
			await this.fireBlockEvent(EventType.PreBlock,inst.block);
			return(await this.fireFieldEvent(EventType.PreField,inst));
		}

		let crow:Row = this.currfld$.field.row;
		let cblock:ModelBlock = this.currfld$.field.mdlblock;

		if (nblock != cblock)
		{
			if (!cblock.validated)
			{
				this.currfld$.focus();
				return(false);
			}

			if (!await this.fireBlockEvent(EventType.PostBlock,cblock.name))
			{
				this.currfld$.focus();
				return(false);
			}

			if (!await this.fireBlockEvent(EventType.PreBlock,nblock.name))
			{
				this.currfld$.focus();
				return(false);
			}
		}

		if (nrow != crow)
		{
			if (!await this.fireBlockEvent(EventType.PostRecord,cblock.name))
			{
				this.currfld$.focus();
				return(false);
			}

			if (!await this.fireBlockEvent(EventType.PreRecord,nblock.name))
			{
				this.currfld$.focus();
				return(false);
			}
		}

		if (!await this.fireFieldEvent(EventType.PostField,this.currfld$))
		{
			this.currfld$.focus();
			return(false);
		}

		if (!await this.fireFieldEvent(EventType.PreField,inst))
		{
			this.currfld$.focus();
			return(false);
		}

		this.currfld$ = inst;
		return(true);
	}

	public async setCurrentBlock(block:string) : Promise<boolean>
	{
		if (this.block$ == null)
		{
			this.block$ = this.getBlock(block);
			if (this.block$ == null) return(false);

			if (!await this.mdlfrm$.setCurrentBlock(block))
				return(false);

			return(true);
		}

		if (this.block$.name == block)
			return(true);

		let cont:boolean = await this.mdlfrm$.setCurrentBlock(block);
		this.block$ = this.getBlock(block);

		return(cont);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to viewform: "+this.parent$.constructor.name);
	}

	private linkModels() : void
	{
		this.mdlfrm$ = ModelForm.getForm(this.parent);
		this.blocks.forEach((blk) => {blk.linkModel();});
	}

	private async fireBlockEvent(type:EventType, block:string) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newBlockEvent(type,this.parent,block)
		return(FormEvents.raise(frmevent));
	}

	private async fireFieldEvent(type:EventType, inst:FieldInstance) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newFieldEvent(type,inst);
		return(FormEvents.raise(frmevent));
	}
}