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

import { Form } from "./Form.js";
import { Block } from "./Block.js";
import { Record } from "./Record.js";
import { Alert } from "../application/Alert.js";
import { Field } from "../view/fields/Field.js";
import { Block as ViewBlock } from "../view/Block.js";
import { EventType } from "../control/events/EventType.js";
import { FieldInstance } from "../view/fields/FieldInstance.js";
import { FieldProperties } from "../view/fields/FieldProperties.js";
import { FieldFeatureFactory } from "../view/FieldFeatureFactory.js";

/*
	The EventTransaction ensures that changes to records only gets applied if all
	eventhandlers returns true. When a transaction is active, it is only possible
	to do changes to records participating in the transction.

	During FormEvents, only changes to default properties is possible.
*/

class Transaction
{
	event:EventType = null;
	blocktrx:BlockTransaction = null;

	blkprops:Map<string,BlockProperties> =
		new Map<string,BlockProperties>();

	constructor(event:EventType, block?:Block, record?:Record, offset?:number, applyvw?:boolean)
	{
		this.event = event;

		if (block != null)
			this.blocktrx = new BlockTransaction(block,record,offset,applyvw);
	}
}

export interface PropertyChange
{
	defprops:boolean;
	inst:FieldInstance;
	props:FieldProperties;
}

export class EventTransaction
{
	private form:Form = null;
	private frmtrx:Transaction = null;

	private blocktrxs:Map<string,Transaction> =
		new Map<string,Transaction>();

	constructor(form:Form)
	{
		this.form = form;
	}

	public join(event:EventType, block?:Block, record?:Record, offset?:number, applyvw?:boolean) : void
	{
		let trx:Transaction = null;

		if (block != null)
		{
			if (offset == null) offset = 0;
			if (applyvw == null) applyvw = true;
			if (record == null) record = block.getRecord(offset);

			trx = new Transaction(event,block,record,offset,applyvw);
			this.blocktrxs.set(block.name,trx);
		}
		else
		{
			this.frmtrx = new Transaction(event);
		}

	}

	public get active() : boolean
	{
		return(this.frmtrx != null || this.blocktrxs.size > 0);
	}

	public get formtrx() : boolean
	{
		return(this.frmtrx != null)
	}

	public get event() : string
	{
		let type:EventType = null;
		type = this.getActive()?.event;
		if (type == null) return(null);
		else   return(EventType[type]);
	}

	public getProperties(inst:FieldInstance) : FieldProperties
	{
		let trx:Transaction = this.getActive(inst.block);

		let propmap:Map<string,BlockProperties> = trx.blkprops;
		let blkprop:BlockProperties = propmap.get(inst.block);

		if (blkprop == null)
		{
			blkprop = new BlockProperties();
			propmap.set(inst.block,blkprop);
		}

		let instprop:InstanceProperties = blkprop.get(inst);
		return(instprop.properties);
	}

	public getDefaultProperties(inst:FieldInstance) : FieldProperties
	{
		let trx:Transaction = this.getActive(inst.block);

		let propmap:Map<string,BlockProperties> = trx.blkprops;
		let blkprop:BlockProperties = propmap.get(inst.block);

		if (blkprop == null)
		{
			blkprop = new BlockProperties();
			propmap.set(inst.block,blkprop);
		}

		let instprop:InstanceProperties = blkprop.get(inst);
		return(instprop.defproperties);
	}

	public addPropertyChange(inst:FieldInstance, props:FieldProperties, defprops:boolean) : void
	{
		let trx:Transaction = this.getActive(inst.block);

		if (trx == null || (this.formtrx && !defprops))
		{
			Alert.fatal("Block "+inst.block+" is not in transaction","setProperties");
			return;
		}

		let propmap:Map<string,BlockProperties> = trx.blkprops;
		let blkprop:BlockProperties = propmap.get(inst.block);

		let instprop:InstanceProperties = blkprop.get(inst);

		if (!defprops) instprop.properties = props;
		else		   instprop.defproperties = props;
	}

	public getValue(block:Block|ViewBlock, field:string) : any
	{
		let trx:BlockTransaction = this.getActive(block.name)?.blocktrx;
		if (block instanceof ViewBlock) block = block.model;

		if (trx == null)
		{
			let fld:Field = block.view.getField(field);
			if (fld != null) return(fld.getValue());
			else return(block.getValue(field));
		}

		return(trx.getValue(field));
	}

	public setValue(block:Block|ViewBlock, field:string, value:any) : boolean
	{
		let trx:BlockTransaction = this.getActive(block.name)?.blocktrx;
		if (block instanceof ViewBlock) block = block.model;

		if (trx == null)
		{
			Alert.fatal("Block '"+block.name+"' is not in transaction","setProperties");
			return(false);
		}

		return(trx.setValue(field,value));
	}

	public applyFormChanges(event:EventType) : void
	{
		this.frmtrx.blocktrx.apply();
		this.frmtrx.blkprops.forEach((props) => props.apply());
		this.frmtrx = null;
	}

	public applyBlockChanges(event:EventType, block:Block|ViewBlock) : void
	{
		console.log("apply "+EventType[event])
		let trx:Transaction = this.blocktrxs.get(block.name);

		if (trx == null)
		{
			Alert.fatal("Block '"+block.name+"' is not in transaction","setProperties");
			return;
		}

		trx.blocktrx.apply();
		trx.blkprops.forEach((props) => props.apply());

		this.blocktrxs.delete(block.name);
	}

	public undoChanges(event:EventType, block?:Block|ViewBlock) : void
	{
		console.log("remove "+EventType[event]);
		if (block == null) this.frmtrx = null;
		else this.blocktrxs.delete(block.name);
	}

	private getActive(block?:string) : Transaction
	{
		if (this.frmtrx != null) return(this.frmtrx);
		if (block == null) block = this.blocktrxs.keys().next().value;
		return(this.blocktrxs.get(block));
	}
}

class BlockTransaction
{
	offset:number = 0;
	block:Block = null;
	record:Record = null;
	wrkcpy:Record = null;
	applyvw:boolean = true;

	constructor(block:Block, record:Record, offset:number, applyvw:boolean)
	{
		this.block = block;
		this.offset = offset;
		this.record = record;
		this.applyvw = applyvw;
	}

	public getValue(field:string) : any
	{
		if (this.wrkcpy == null)
			return(this.record.getValue(field));

		return(this.wrkcpy.getValue(field));
	}

	public setValue(field:string, value:any) : boolean
	{
		if (this.wrkcpy == null)
		{
			this.wrkcpy = new Record(null);

			this.record.values.forEach((column) =>
			{this.wrkcpy.setValue(column.name,column.value)})
		}

		this.wrkcpy.setValue(field,value);
		return(true);
	}

	public apply() : void
	{
		if (this.wrkcpy == null)
			return;

		this.wrkcpy.values.forEach((column) =>
		{this.record.setValue(column.name,column.value)});

		if (this.applyvw)
		{
			let rownum:number = this.block.view.row;
			this.block.view.refresh(rownum+this.offset,this.record);
		}
	}
}

class BlockProperties
{
	private instances:Map<FieldInstance,InstanceProperties> =
		new Map<FieldInstance,InstanceProperties>();

	get(inst:FieldInstance) : InstanceProperties
	{
		let instprop:InstanceProperties = this.instances.get(inst);

		if (instprop == null)
		{
			instprop = new InstanceProperties(inst);
			this.instances.set(inst,instprop);
		}

		return(instprop);
	}

	apply() : void
	{
		this.instances.forEach((instprop) => {instprop.apply()})
	}
}

class InstanceProperties
{
	inst:FieldInstance;
	pchange:boolean = false;
	dchange:boolean = false;
	properties$:FieldProperties = null;
	defproperties$:FieldProperties = null;

	constructor(inst:FieldInstance)
	{
		this.inst = inst;
		this.properties = inst.properties;
		this.defproperties$ = FieldFeatureFactory.clone(inst.defaultProperties);
	}

	set properties(props:FieldProperties)
	{
		this.pchange = true;
		this.properties$ = props;
	}

	set defproperties(props:FieldProperties)
	{
		this.dchange = true;
		this.defproperties$ = props;
	}

	get properties() : FieldProperties
	{
		return(this.properties$);
	}

	get defproperties() : FieldProperties
	{
		return(this.defproperties$);
	}

	apply() : void
	{
		if (this.pchange) this.inst.applyProperties(this.properties$);

		if (this.dchange)
		{
			FieldFeatureFactory.copyBasic(this.defproperties$,this.inst.defaultProperties);
			this.inst.updateDefaultProperties();
		}
	}
}