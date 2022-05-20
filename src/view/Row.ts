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

import { Block } from "./Block.js";
import { Field } from "./fields/Field.js";
import { FieldInstance } from "./fields/FieldInstance.js";


export class Row
{
	private block$:Block = null;
	private rownum$:number = null;
	private validated$:boolean = true;
	private instances:FieldInstance[] = [];
	private fields:Map<string,Field> = new Map<string,Field>();

	constructor(block:Block, rownum:number)
	{
		this.block$ = block;
		this.rownum$ = rownum;
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public get rownum() : number
	{
		return(this.rownum$);
	}

	public set rownum(rownum:number)
	{
		if (rownum == this.rownum$)
			return;

		this.rownum$ = rownum;

		this.getFields().forEach((fld) =>
		{
			fld.getInstances().forEach((inst) =>
			{inst.row = rownum;})
		});
	}

	public get validated() : boolean
	{
		if (this.rownum >= 0) return(this.validated$);
		else return(this.block.getCurrentRow().validated$);
	}

	public set validated(flag:boolean)
	{
		if (this.rownum >= 0) this.validated$ = flag;
		else this.block.getCurrentRow().validated$ = flag;
	}

	public validateFields() : boolean
	{
		if (this.validated)
			return(true);

		let fields:Field[] = this.getFields();

		for (let i = 0; i < fields.length; i++)
			if (!fields[i].valid) return(false);

		if (this.rownum >= 0)
		{
			let curr:Row = this.block.getRow(-1);

			if (curr != null)
			{
				fields = curr.getFields();

				for (let i = 0; i < fields.length; i++)
					if (!fields[i].valid) return(false);
			}
		}
		else
		{
			fields = this.block.getCurrentRow().getFields();

			for (let i = 0; i < fields.length; i++)
				if (!fields[i].valid) return(false);
		}

		return(true);
	}

	public addField(field:Field) : void
	{
		this.fields.set(field.name,field);
	}

	public addInstance(instance:FieldInstance) : void
	{
		this.instances.push(instance);
	}

	public nextField(inst:FieldInstance) : FieldInstance
	{
		let pos:number = this.instances.indexOf(inst) + 1;
		return(this.instances[pos%this.instances.length]);
	}

	public isFirstField(inst:FieldInstance) : boolean
	{
		return(inst == this.instances[0]);
	}

	public getField(name:string) : Field
	{
		return(this.fields.get(name));
	}

	public getFields() : Field[]
	{
		let fields:Field[] = [];

		this.fields.forEach((fld) =>
		{fields.push(fld)});

		return(fields);
	}

	public getFieldInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((field) =>
		{instances.push(...field.getInstances());});

		return(instances);
	}

	public distribute(field:Field, value:string) : void
	{
		this.fields.get(field.name)?.distribute(null,value);
	}

	public getInstancesByName(name:string, id?:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];
		let field:Field = this.getField(name);

		if (field != null)
		{
			if (id == null)
			{
				instances.push(...field.getInstances());
			}
			else
			{
				field.getInstances().forEach((inst) =>
				{
					if (inst.id == id)
						instances.push(inst);
				});
			}
		}

		return(instances);
	}

	public getInstancesByClass(name:string, clazz:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];
		let field:Field = this.getField(name);

		if (field != null)
		{
			field.getInstances().forEach((inst) =>
			{
				if (inst.properties.hasClass(clazz))
					instances.push(inst);
			});
		}

		return(instances);
	}
}