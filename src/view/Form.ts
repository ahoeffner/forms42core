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
import { KeyMap } from '../control/events/KeyMap.js';

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
	private curinst$:FieldInstance = null;
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
		this.curinst$?.focus();
	}

	public validated() : boolean
	{
		if (this.curinst$ == null)
			return(true);

		let block:Block = this.getBlock(this.curinst$.block);

		if (!block.validated)
		{
			this.focus();
			return(false);
		}

		return(true);
	}

	public async goto(inst:FieldInstance) : Promise<boolean>
	{
		/**********************************************************************
			Go to form
		 **********************************************************************/

		if (this.parent != Form.currfrm$)
		{
			let preform:Form = this;

			if (Form.currfrm$ != null)
			{
				preform = Form.getForm(Form.currfrm$);

				// If not in call and not valid => return(false);

				if (!await this.fireFormEvent(EventType.PostForm,Form.currfrm$))
				{
					preform.focus();
					return(false);
				}
			}

			if (!await this.fireFormEvent(EventType.PreForm,this.parent))
			{
				preform.focus();
				return(false);
			}
		}

		/**********************************************************************
			Leave this forms current record and block
		 **********************************************************************/

		let nxtblock:Block = inst.field.block;
		let recoffset:number = nxtblock.offset(inst);
		let preblock:Block = this.curinst$?.field.block;

		if (preblock != null)
		{
			// PostField already fired on blur

			if (preblock != nxtblock)
			{
				if (!await this.fireBlockEvent(EventType.PostRecord,preblock.name))
				{
					this.focus();
					return(false);
				}

				if (!await this.fireBlockEvent(EventType.PostBlock,preblock.name))
				{
					this.focus();
					return(false);
				}
			}
			else if (recoffset != 0)
			{
				if (!await this.fireBlockEvent(EventType.PostRecord,preblock.name))
				{
					this.focus();
					return(false);
				}
			}
		}

		/**********************************************************************
			Enter this forms current block and record
		 **********************************************************************/

		if (nxtblock != preblock)
		{
			if (!await this.fireBlockEvent(EventType.PreBlock,nxtblock.name))
			{
				this.focus();
				return(false);
			}

			// Move to record

			if (!await this.fireBlockEvent(EventType.PreRecord,nxtblock.name))
			{
				this.focus();
				// Move back
				return(false);
			}
		}
		else if (recoffset != 0)
		{
			// Move to record

			if (!await this.fireBlockEvent(EventType.PreRecord,nxtblock.name))
			{
				this.focus();
				// Move back
				return(false);
			}
		}

		this.curinst$ = inst;
		Form.currfrm$ = this.parent;

		return(true);
	}

	public async leave(inst:FieldInstance) : Promise<boolean>
	{
		if (!await this.fireFieldEvent(EventType.PostField,inst))
		{
			this.focus();
			return(false);
		}

		return(true);
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