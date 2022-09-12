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
import { Record } from '../model/Record.js';
import { BrowserEvent } from './BrowserEvent.js';
import { Form as ModelForm } from '../model/Form.js';
import { Logger, Type } from '../application/Logger.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { FieldInstance } from './fields/FieldInstance.js';
import { EventType } from '../control/events/EventType.js';
import { FormBacking } from '../application/FormBacking.js';
import { FormsModule } from '../application/FormsModule.js';
import { Indicator } from '../application/tags/Indicator.js';
import { KeyMap, KeyMapping } from '../control/events/KeyMap.js';
import { FilterEditor } from '../internal/forms/FilterEditor.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';
import { MouseMap, MouseMapParser } from '../control/events/MouseMap.js';
import { Status } from './Row.js';

export class Form implements EventListenerObject
{
	private static curform$:Form = null;
	public static current() : Form {return(Form.curform$);}

	private modfrm$:ModelForm = null;
	private parent$:InterfaceForm = null;
	private curinst$:FieldInstance = null;
	private blocks$:Map<string,Block> = new Map<string,Block>();
	private indicators:Map<string,Indicator[]> = new Map<string,Indicator[]>();

	constructor(parent:InterfaceForm)
	{
		this.parent$ = parent;
		FormBacking.setViewForm(parent,this);
		this.modfrm$ = FormBacking.getModelForm(this.parent,true);
		Logger.log(Type.formbinding,"Create viewform: "+this.parent.name);
	}

	public get name() : string
	{
		return(this.constructor.name.toLowerCase());
	}

	public get parent() : InterfaceForm
	{
		return(this.parent$);
	}

	public modform() : ModelForm
	{
		return(this.modfrm$);
	}

	public get block() : Block
	{
		return(this.curinst$?.field.block);
	}

	public get instance() : FieldInstance
	{
		return(this.curinst$);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks$.get(name));
	}

	public getBlocks() : Block[]
	{
		let blocks:Block[] = [];

		this.blocks$.forEach((block) =>
			{blocks.push(block)})

		return(blocks);
	}

	public addBlock(block:Block) : void
	{
		this.blocks$.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to viewform: "+this.parent.name);
	}

	public getIndicators(block:string) : Indicator[]
	{
		let indicators:Indicator[] = this.indicators.get(block);
		if (indicators == null) return([]);
		return(indicators);
	}

	public addIndicator(ind:Indicator) : void
	{
		let block:string = ind.binding.toLowerCase();
		let indicators:Indicator[] = this.indicators.get(block);

		if (indicators == null)
		{
			indicators = [];
			this.indicators.set(block,indicators);
		}

		indicators.push(ind);
	}

	public focus() : void
	{
		if (this.curinst$)
		{
			this.curinst$?.focus();
			return;
		}
		else if (this.blocks$.size > 0)
		{
			this.blocks$.values().next().value.focus();
			return;
		}
	}

	public async validate() : Promise<boolean>
	{
		return(this.curinst$.field.block.validateBlock());
	}

	public validated() : boolean
	{
		let valid:boolean = true;

		this.blocks$.forEach((blk) =>
		{
			if (!blk.validated)
				valid = false;
		})

		if (!valid)
		{
			this.focus();
			return(false);
		}

		return(true);
	}

	public async enter(inst:FieldInstance) : Promise<boolean>
	{
		let preform:Form = null;
		let nxtblock:Block = inst.field.block;
		let recoffset:number = nxtblock.offset(inst);
		let preblock:Block = this.curinst$?.field.block;

		/**********************************************************************
			Go to form
		 **********************************************************************/

		if (this != Form.curform$)
		{
			preform = this;

			if (Form.curform$ != null)
			{
				preform = Form.curform$;

				if (!preform.validated)
				{
					preform.focus();
					return(false);
				}

				if (!await this.leaveForm(preform))
				{
					preform.focus();
					return(false);
				}
			}

			if (!await this.enterForm(this))
			{
				preform.focus();
				return(false);
			}
		}

		/**********************************************************************
			Leave this forms current record and block
		 **********************************************************************/

		if (preblock != null)
		{
			// PostField already fired on blur

			if (preblock != nxtblock)
			{
				if (!await preblock.validateBlock())
				{
					this.focus();
					return(false);
				}

				if (!await this.leaveRecord(preblock))
				{
					this.focus();
					return(false);
				}

				if (!await this.leaveBlock(preblock))
				{
					this.focus();
					return(false);
				}
			}
			else if (recoffset != 0)
			{
				if (!await nxtblock.validateRow())
				{
					this.focus();
					return(false);
				}

				if (!await this.leaveRecord(preblock))
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
			if (!await this.enterBlock(nxtblock,recoffset))
			{
				this.focus();
				return(false);
			}

			if (!await this.enterRecord(nxtblock,recoffset))
			{
				this.focus();
				return(false);
			}
		}
		else if (recoffset != 0)
		{
			if (!await this.enterRecord(nxtblock,recoffset))
			{
				this.focus();
				return(false);
			}
		}

		// Prefield

		if (!await this.enterField(inst,recoffset))
		{
			this.focus();
			return(false);
		}

		Form.curform$ = this;
		this.curinst$ = inst;
		inst.field.block.current = inst;
		nxtblock.setCurrentRow(inst.row);

		if (preform)
		{
			// Successfully navigated from preform to this form
			if (!this.modform().wait4EventTransaction(EventType.PostFormFocus,null)) return(false);
			let success:boolean = await this.fireFormEvent(EventType.PostFormFocus,this.parent);
			return(success);
		}

		return(true);
	}

	public async leave(inst:FieldInstance) : Promise<boolean>
	{
		if (!await this.LeaveField(inst))
		{
			Form.curform$.focus();
			return(false);
		}
		return(true);
	}

	public async enterForm(form:Form) : Promise<boolean>
	{
		if (!await this.setEventTransaction(EventType.PreForm)) return(false);
		let success:boolean = await this.fireFormEvent(EventType.PreForm,form.parent);
		this.modform().endEventTransaction(EventType.PreForm,null,success);
		if (success && form.parent.navigable) this.setURL();
		return(success);
	}

	public async enterBlock(block:Block, offset:number) : Promise<boolean>
	{
		if (!await this.setEventTransaction(EventType.PreForm,block,offset)) return(false);
		let success:boolean = await this.fireBlockEvent(EventType.PreBlock,block.name);
		block.model.endEventTransaction(EventType.PreBlock,success);
		return(success);
	}

	public async enterRecord(block:Block, offset:number) : Promise<boolean>
	{
		if (!await this.setEventTransaction(EventType.PreRecord,block,offset)) return(false);
		let success:boolean = await this.fireBlockEvent(EventType.PreRecord,block.name);
		block.model.endEventTransaction(EventType.PreRecord,success);
		return(success);
	}

	public async enterField(inst:FieldInstance, offset:number) : Promise<boolean>
	{
		if (!await this.setEventTransaction(EventType.PreField,inst.field.block,offset)) return(false);
		let success:boolean = await this.fireFieldEvent(EventType.PreField,inst);
		inst.field.block.model.endEventTransaction(EventType.PreField,success);
		return(success);
	}

	public async leaveForm(form:Form) : Promise<boolean>
	{
		if (!await this.modform().wait4EventTransaction(EventType.PostForm,null)) return(false);
		let success:boolean = await this.fireFormEvent(EventType.PostForm,form.parent);
		return(success);
	}

	public async leaveBlock(block:Block) : Promise<boolean>
	{
		if (!await block.model.wait4EventTransaction(EventType.PostBlock)) return(false);
		let success:boolean = await this.fireBlockEvent(EventType.PostBlock,block.name);
		return(success);
	}

	public async leaveRecord(block:Block) : Promise<boolean>
	{
		if (!await block.model.wait4EventTransaction(EventType.PostRecord)) return(false);
		let success:boolean = await this.fireBlockEvent(EventType.PostRecord,block.name);
		return(success);
	}

	public async LeaveField(inst:FieldInstance) : Promise<boolean>
	{
		if (!await inst.field.block.model.wait4EventTransaction(EventType.PostField)) return(false);
		let success:boolean = await this.fireFieldEvent(EventType.PostField,inst);
		return(success);
	}

	public async keyhandler(key:KeyMap, inst?:FieldInstance) : Promise<boolean>
	{
		let success:boolean = false;
		let blk:ModelBlock = inst?.field.block.model;

		if (!this.modform().checkEventTransaction(EventType.Key,blk))
			return(false);

		let frmevent:FormEvent = FormEvent.KeyEvent(this.parent,inst,key);

		if (!await FormEvents.raise(frmevent))
			return(false);

		if (inst != null)
		{
			if (key == KeyMap.enter && inst.field.block.model.querymode)
				key = KeyMap.executequery;

			if (KeyMapping.isRowNav(key))
			{
				success = await this.block.navigateRow(key,inst);
				return(success);
			}

			if (KeyMapping.isBlockNav(key))
			{
				success = await this.block.navigateBlock(key,inst);
				return(success);
			}

			if (KeyMapping.isFormNav(key))
			{
				success = await this.navigateForm(key,inst);;
				return(success);
			}

			if (key == KeyMap.escape)
			{
				if (inst.field.row.status == Status.qbe)
				{
					inst.field.block.cancel();
					return(success);
				}

				if (inst.field.row.status == Status.new || inst.field.row.status == Status.insert)
					key = KeyMap.delete;
			}

			if (key == KeyMap.enter)
			{
				if (!await inst.field.validate(inst))
					return(false);

				success = await this.block.validateRow();
				return(success);
			}

			if (key == KeyMap.enterquery)
			{
				if (inst.field.block.model.querymode)
				{
					inst.field.block.model.showLastQuery();
					return(true);
				}

				let success:boolean = false;

				if (!await inst.field.validate(inst))
					return(false);

				if (!inst.field.block.model.ctrlblk && inst.field.block.model.qbeallowed)
					success = await inst.field.block.model.enterQuery();

				if (success)
					inst.field.block.findFirstEditable(inst.field.block.model.qberec)?.focus();

				return(true);
			}

			if (key == KeyMap.queryeditor)
			{
				if (!inst.field.block.model.querymode)
					return(false);

				await this.parent.callform(FilterEditor);
				return(true);
			}

			if (key == KeyMap.executequery)
			{
				let success:boolean = false;

				if (!await inst.field.validate(inst))
					return(false);

				if (!inst.field.block.model.ctrlblk && inst.field.block.model.queryallowed)
					success = await inst.field.block.model.executeQuery();

				if (success)
					inst.field.block.focus();

				return(true);
			}

			if (key == KeyMap.insert)
			{
				if (!await inst.field.validate(inst))
					return(false);

				if (!inst.field.block.model.ctrlblk && inst.field.block.model.insertallowed)
					inst.field.block.model.insert(false);

				return(true);
			}

			if (key == KeyMap.insertAbove)
			{
				if (!await inst.field.validate(inst))
					return(false);

				if (!inst.field.block.model.ctrlblk && inst.field.block.model.insertallowed)
					inst.field.block.model.insert(true);

				return(true);
			}

			if (key == KeyMap.delete)
			{
				if (!inst.field.block.model.ctrlblk && inst.field.block.model.deleteallowed)
					inst.field.block.model.delete();

				return(true);
			}

			return(true);
		}

		return(true);
	}

	public async navigateForm(key:KeyMap, inst:FieldInstance) : Promise<boolean>
	{
		let next:Block = null;

		switch(key)
		{
			case KeyMap.nextblock :
			{
				let blks:Block[] = [...this.blocks$.values()];

				let nxt:boolean = false;
				next = blks[blks.length-1];

				for (let i = 0; i < blks.length; i++)
				{
					if (nxt)
					{
						next = blks[i];
						break;
					}

					if (blks[i] == inst.field.block)
						nxt = true;
				}

				break;
			}

			case KeyMap.prevblock :
			{
				let blks:Block[] = [...this.blocks$.values()];

				next = blks[0];
				let nxt:boolean = false;

				for (let i = blks.length-1; i >= 0; i--)
				{
					if (nxt)
					{
						next = blks[i];
						break;
					}

					if (blks[i] == inst.field.block)
						nxt = true;
				}

				break;
			}
		}

		if (next) next.focus();
		return(next != null);
	}

	public async mousehandler(mevent:MouseMap, inst?:FieldInstance) : Promise<boolean>
	{
		let blk:ModelBlock = inst?.field.block.model;

		if (!this.modform().checkEventTransaction(EventType.Mouse,blk))
			return(false);

		let frmevent:FormEvent = FormEvent.MouseEvent(this.parent,mevent,inst);
		return(FormEvents.raise(frmevent));
	}

	private async setEventTransaction(event:EventType, block?:Block, offset?:number) : Promise<boolean>
	{
		let record:Record = null;

		if (block != null)
		{
			if (offset == null) offset = 0;
			record = block.model.getRecord(offset);
		}

		return(this.modform().setEventTransaction(event,block?.model,record));
	}

	private event:BrowserEvent = BrowserEvent.get();
	public async handleEvent(event:any) : Promise<void>
	{
        let bubble:boolean = false;
		this.event.setEvent(event);

		if (this.event.type == "wait")
			await this.event.wait();

		if (this.event.waiting)
			return;

		if (this.event.accept || this.event.cancel)
			bubble = true;

		if (this.event.bubbleMouseEvent)
			bubble = true;

		if (this.event.onScrollUp)
			bubble = true;

        if (this.event.onScrollDown)
			bubble = true;

        if (this.event.onCtrlKeyDown)
			bubble = true;

        if (this.event.onFuncKey)
			bubble = true;

		this.event.preventDefault();

		if (bubble)
		{
			if (this.event.type.startsWith("key"))
			{
				let key:KeyMap = KeyMapping.parseBrowserEvent(this.event);
				await this.keyhandler(key);
			}
			else
			{
				let mevent:MouseMap = MouseMapParser.parseBrowserEvent(this.event);
				await this.mousehandler(mevent);
			}
		}
	}

	private setURL() : void
	{
		let location:Location = window.location;
		let params:URLSearchParams = new URLSearchParams(location.search);
		let path:string = location.protocol + '//' + location.host + location.pathname;

		let map:string = FormsModule.getFormPath(this.parent.name);

		if (map != null && this.parent.navigable)
		{
			params.set("form",map)
			window.history.replaceState('', '',path+"?"+params);
		}
	}

	public async finalize() : Promise<void>
	{
		this.blocks$.forEach((blk) => {blk.finalize();});
		this.addEvents(this.parent.getView());
		this.indicators.clear();
	}

	private async fireFormEvent(type:EventType, form:InterfaceForm) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.FormEvent(type,form);
		return(FormEvents.raise(frmevent));
	}

	private async fireBlockEvent(type:EventType, block:string) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.BlockEvent(type,this.parent,block);
		return(FormEvents.raise(frmevent));
	}

	private async fireFieldEvent(type:EventType, inst:FieldInstance) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.FieldEvent(type,inst);
		return(FormEvents.raise(frmevent));
	}

    private addEvents(element:HTMLElement) : void
    {
        element.addEventListener("keyup",this);
        element.addEventListener("keydown",this);
        element.addEventListener("keypress",this);

        element.addEventListener("click",this);
        element.addEventListener("dblclick",this);
        element.addEventListener("contextmenu",this);
    }
}