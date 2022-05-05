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

import { Field } from "./Field.js";
import { Class } from "../types/Class.js";
import { FieldTypes } from "./FieldType.js";
import { FieldProperties } from "./FieldProperties.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";


export class FieldInstance
{
	private id$:string = null;
	private row$:number = null;
	private name$:string = null;
	private type$:string = null;
	private field$:Field = null;
	private block$:string = null;
	private component$:any = null;
	private element$:HTMLElement = null;
	private impl:FieldImplementation = null;
	private properties$:FieldProperties = null;

	constructor(component:any,element:HTMLElement)
	{
		this.component$ = component;

		this.id$ = element.getAttribute("id");
		this.row$ = +element.getAttribute("row");
		this.name$ = element.getAttribute("name");
		this.type$ = element.getAttribute("type");

		if (this.id$ == null)
			this.id$ = "";

		if (this.name$ == null)
			this.name$ = "";

		if (this.type$ == null)
			this.type$ = "text";

		if (this.block$ == null)
			this.block$ = "";

		if (this.row$ == null || this.row$ < 0)
			this.row$ = -1;

		this.id$ = this.id$.toLowerCase();
		this.name$ = this.name$.toLowerCase();
		this.type$ = this.type$.toLowerCase();
		this.block$ = this.block$.toLowerCase();

		this.properties$ = FieldProperties.get(component,this.block$,this.name$,this.id$);
		this.properties$.initialize(element);

		let impl:Class<FieldImplementation> = FieldTypes.get(this.type$);

		this.impl = new impl();
		this.impl.initialize(this);

		FieldInstances.add(component,this);
		this.element$ = this.impl.getElement();
	}

	public get id() : string
	{
		return(this.id$);
	}

	public get row() : number
	{
		return(this.row$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get type() : string
	{
		return(this.type$);
	}

	public get block() : string
	{
		return(this.block$);
	}

	public get field() : Field
	{
		return(this.field$);
	}

	public get properties() : FieldProperties
	{
		return(this.properties$);
	}

	public get component() : any
	{
		return(this.component$);
	}

	public get element() : HTMLElement
	{
		return(this.element$);
	}
}


export class FieldInstances
{
	public static add(component:any,field:FieldInstance) : void
	{
		let block:Block = Block.get(component,field.block,true);
		let row:Row = block.getRow(field.row,true);
		row.add(field);
	}

	public static getRow(component:any, block:string, row:number) : Row
	{
		let blk:Block = Block.get(component,block,false);
		if (blk == null) return(new Row());
		return(blk.getRow(row,false));
	}
}


class Block
{
	// Block by component and blockname

	private static map:Map<any,Map<string,Block>> =
		new Map<any,Map<string,Block>>();

	private rows:Map<number,Row> = new Map<number,Row>();
	private fields:Map<string,Field> = new Map<string,Field>();


	public static get(component:any,block:string, create:boolean) : Block
	{
		let blkmap:Map<string,Block> = Block.map.get(component);

		if (blkmap == null)
		{
			if (!create) return(null);
			blkmap = new Map<string,Block>();
			Block.map.set(component,blkmap);
		}

		let blk:Block = blkmap.get(block);

		if (blk == null && create)
		{
			blk = new Block();
			blkmap.set(block,blk);
		}

		return(blk);
	}

	public getField(name:string, create:boolean) : Field
	{
		let field:Field = this.fields.get(name.toLowerCase());
		if (field == null && create) field = new Field();
		return(field);
	}

	public getRow(row:number, create:boolean) : Row
	{
		let rec:Row = this.rows.get(row);

		if (rec == null)
		{
			rec = new Row();
			if (create) this.rows.set(row,rec);
		}

		return(rec);
	}
}


class Row
{
	private groups:Map<string,FieldInstance[]> = new Map<string,FieldInstance[]>();

	public add(field:FieldInstance) : void
	{
		let fields:FieldInstance[] = this.groups.get(field.name);

		if (fields == null)
		{
			fields = [];
			this.groups.set(field.name,fields);
		}

		fields.push(field);
	}


	public getAll() : FieldInstance[]
	{
		let fields:FieldInstance[] = [];

		this.groups.forEach((flds) =>
		{fields.push(...flds)});

		return(fields);
	}


	public getByName(name:string, id?:string) : FieldInstance[]
	{
		let fields:FieldInstance[] = this.groups.get(name.toLowerCase());
		if (fields == null) return([]);

		if (id != null)
		{
			id = id.toLowerCase();
			let ids:FieldInstance[] = [];
			fields.forEach((fld) =>
			{
				if (fld.id == id)
					ids.push(fld);
			});

			fields = ids;
		}

		return(fields);
	}


	public getByClass(name:string, clazz:string) : FieldInstance[]
	{
		let fields:FieldInstance[] = this.groups.get(name.toLowerCase());
		if (fields == null) return([]);

		let classes:FieldInstance[] = [];

		fields.forEach((fld) =>
		{
			if (fld.properties.hasClass(clazz))
				classes.push(fld);
		});

		return(classes);
	}
}
