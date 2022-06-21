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
import { Logger, Type } from '../application/Logger.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { FieldInstance } from './fields/FieldInstance.js';
import { EventType } from '../control/events/EventType.js';
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

	private parent$:InterfaceForm = null;
	private currinst$:FieldInstance = null;
	private static currfrm$:InterfaceForm = null;
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

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to viewform: "+this.parent$.constructor.name);
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

	public focus() : void
	{
		this.currinst$?.focus();
	}

	public validate() : boolean
	{
		if (this.currinst$ == null)
			return(true);

		let block:Block = this.getBlock(this.currinst$.block);

		if (!block.model.validated)
		{
			this.focus();
			return(false);
		}

		return(true);
	}


	public async preField(inst:FieldInstance) : Promise<boolean>
	{
		let pform:Form = this;
		let nform:Form = this;

		let nblock:Block = inst.field.block;
		let pblock:Block = this.currinst$?.field.block;

		let prec:number = pblock.model.record;
		let nrec:number = inst.field.block.model.record;

		//Execute PostXXXX triggers

		// No changes in record or block on previous form, just fire postform
		if (this.parent != Form.currfrm$ && Form.currfrm$ != null)
		{
			pform = Form.getForm(Form.currfrm$);

			if (!await this.fireFormEvent(EventType.PostForm,Form.currfrm$))
			{
				pform.focus();
				return(false);
			}
		}

		// PostField already fired on blur

		if (!await this.postRecord(nblock,prec,nrec))
		{
			nform.focus();
			return(false);
		}

		if (!await this.postBlock(pblock))
		{
			nform.focus();
			return(false);
		}

		// Execute PreXXXX triggers

		if (!await this.preForm(this.parent))
		{
			pform.focus();
			return(false);
		}

		if (!await this.preBlock(nblock))
		{
			nform.focus();
			return(false);
		}

		if (!await this.preRecord(nblock,prec,nrec))
		{
			nform.focus();
			return(false);
		}

		this.currinst$ = inst;
		Form.currfrm$ = this.parent;

		return(true);
	}

	private async preForm(form:InterfaceForm) : Promise<boolean>
	{
		if (this.parent == Form.currfrm$) return(true);
		return(await this.fireFormEvent(EventType.PreForm,form));
	}

	private async preBlock(block:Block) : Promise<boolean>
	{
		if (block == this.currinst$.field.block) return(true);
		return(await this.fireBlockEvent(EventType.PreBlock,block.name));
	}

	private async postBlock(block:Block) : Promise<boolean>
	{
		if (block == this.currinst$.field.block) return(true);
		return(await this.fireBlockEvent(EventType.PreBlock,block.name))
	}

	private async preRecord(block:Block, prec:number, nrec:number) : Promise<boolean>
	{
		if (nrec == prec) return(true);
		return(await this.fireBlockEvent(EventType.PreRecord,block.name))
	}

	private async postRecord(block:Block, prec:number, nrec:number) : Promise<boolean>
	{
		if (nrec == prec)
			return(true);

		if (!await block.validateRow())
			return(false);

		return(await this.fireBlockEvent(EventType.PostRecord,block.name))
	}

	public async postField(inst:FieldInstance) : Promise<boolean>
	{
		return(await this.fireFieldEvent(EventType.PostRecord,inst))
	}

	private linkModels() : void
	{
		this.blocks.forEach((blk) => {blk.linkModel();});
	}

	private async fireFormEvent(type:EventType, form:InterfaceForm) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newFormEvent(type,form);
		return(FormEvents.raise(frmevent));
	}

	private async fireBlockEvent(type:EventType, block:string) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newBlockEvent(type,this.parent,block);
		return(FormEvents.raise(frmevent));
	}

	private async fireFieldEvent(type:EventType, inst:FieldInstance) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newFieldEvent(type,inst);
		return(FormEvents.raise(frmevent));
	}
}