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
import { Row, Status } from "./Row.js";
import { Field } from "./fields/Field.js";
import { KeyMap } from "../control/events/KeyMap.js";
import { Block as ModelBlock } from '../model/Block.js';
import { RecordProperties } from "./RecordProperties.js";
import { Record, RecordStatus } from "../model/Record.js";
import { FieldInstance } from "./fields/FieldInstance.js";
import { EventType } from "../control/events/EventType.js";
import { FormBacking } from "../application/FormBacking.js";
import { FieldProperties } from "../public/FieldProperties.js";
import { FieldFeatureFactory } from "./FieldFeatureFactory.js";
import { DataType } from "./fields/implementations/DataType.js";
import { FieldState } from "./fields/interfaces/FieldImplementation.js";
import { FormEvent, FormEvents } from "../control/events/FormEvents.js";


export class Block
{
	private rc$:number = -1;
	private row$:number = -1;
	private form$:Form = null;
	private name$:string = null;
	private model$:ModelBlock = null;
	private fieldnames$:string[] = null;
	private curinst$:FieldInstance = null;
	private rows$:Map<number,Row> = new Map<number,Row>();
	private displayed$:Map<object,Row> = new Map<object,Row>();
	private recprops$:RecordProperties = new RecordProperties();

	constructor(form:Form,name:string)
	{
		this.name$ = name;
		this.form$ = form;
		this.fieldnames$ = [];
		this.form.addBlock(this);
		FormBacking.getModelBlock(this,true);
	}

	public get row() : number
	{
		if (this.row$ < 0) return(0);
		else               return(this.row$);
	}

	public get rows() : number
	{
		return(this.rc$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get model() : ModelBlock
	{
		return(this.model$);
	}

	public get current() : FieldInstance
	{
		if (this.curinst$ == null)
			this.curinst$ = this.getCurrentRow().getFirstInstance(Status.na);

		return(this.curinst$);
	}

	public set current(inst:FieldInstance)
	{
		this.curinst$ = inst;
	}

	public blur() : void
	{
		this.current?.blur();
	}

	public focus() : void
	{
		this.current?.focus();
	}

	public getAllFields(field?:string) : Field[]
	{
		let fields:Field[] = [];
		let current:Row = this.getRow(-1);

		if (field == null)
		{
			if (current != null)
				fields.push(...current.getFields());

			for (let i = 0; i < this.rows; i++)
				fields.push(...this.getRow(i).getFields());
		}
		else
		{
			if (current != null)
			{
				let fld:Field = current.getField(field);
				if (fld != null) fields.push(fld);
			}

			for (let i = 0; i < this.rows; i++)
			{
				let fld:Field = this.getRow(i).getField(field);
				if (fld != null) fields.push(fld);
			}
		}

		return(fields);
	}

	public getCurrentFields(name?:string) : Field[]
	{
		let row:Row = null;
		let fields:Field[] = [];

		if (this.model.empty)
			return(fields);

		row = this.getRow(this.row);
		if (row != null) fields.push(...row.getFields());

		row = this.getRow(-1);
		if (row != null) fields.push(...row.getFields());

		if (name != null)
		{
			let named:Field[] = [];
			name = name.toLowerCase();

			fields.forEach((fld) =>
			{
				if (fld.name == name)
					named.push(fld);
			})

			fields = named;
		}

		return(fields);
	}

	public getFieldById(field:string, id:string) : FieldInstance
	{
		let fields:Field[] = this.getAllFields(field);

		for (let f = 0; f < fields.length; f++)
		{
			let instances:FieldInstance[] = fields[f].getInstances();

			for (let i = 0; i < instances.length; i++)
			{
				if (instances[i].id == id)
					return(instances[i]);
			}
		}

		return(null);
	}

	public getFieldsByClass(field:string, clazz:string) : FieldInstance[]
	{
		let matched:FieldInstance[] = [];
		let fields:Field[] = this.getAllFields(field);

		for (let f = 0; f < fields.length; f++)
		{
			let instances:FieldInstance[] = fields[f].getInstances();

			if (clazz == null)
			{
				matched.push(...instances);
			}
			else
			{
				for (let i = 0; i < instances.length; i++)
				{
					if (instances[i].properties.hasClass(clazz))
						matched.push(instances[i]);
				}
			}
		}

		return(matched);
	}

	public getFieldInstances() : FieldInstance[]
	{
		let row:Row = null;
		let instances:FieldInstance[] = [];

		row = this.getRow(this.row);
		if (row != null) instances.push(...row.getFieldInstances());

		row = this.getRow(-1);
		if (row != null) instances.push(...row.getFieldInstances());

		return(instances);
	}

	public getFieldNames() : string[]
	{
		return(this.fieldnames$);
	}

	public getRecordProperties(record:Record, field:string, clazz:string) : FieldProperties
	{
		let curr:boolean = false;

		if (field == null)
		{
			curr = true;
			field = this.current.name;
		}

		let props:FieldProperties = this.recprops$.get(record,field,clazz);

		if (props == null && curr)
			props = this.current.properties;

		return(props);
	}

	public setRecordProperties(record:Record, field:string, clazz:string, props:FieldProperties) : void
	{
		if (props == null)
		{
			this.recprops$.delete(record,field,clazz);

			let row:Row = this.displayed(record);
			this.recprops$.reset(row,field,clazz);

			if (this.row == row.rownum)
			{
				row = this.getRow(-1);

				if (row != null)
					this.recprops$.reset(row,field,clazz);
			}
		}
		else
		{
			this.recprops$.set(record,field,clazz,props);

			if (this.displayed(record))
			{
				this.applyRecordProperties(record,true,field);
				this.applyRecordProperties(record,false,field);
			}
		}
	}

	public applyRecordProperties(record:Record, baserec:boolean, field?:string) : void
	{
		let row:Row = this.displayed(record);
		if (!baserec) row = this.getRow(-1);
		this.recprops$.apply(row,record,field);
	}

	public async setEventTransaction(event:EventType) : Promise<void>
	{
		let record:Record = this.model.getRecord();
		await this.model.setEventTransaction(event,record);
	}

	public endEventTransaction(event:EventType, apply:boolean) : void
	{
		this.model.endEventTransaction(event,apply);
	}

	public async lock(inst?:FieldInstance) : Promise<boolean>
	{
		if (this.model.locked()) return(true);

		await this.setEventTransaction(EventType.OnLockRecord);
		let success:boolean = await this.fireFieldEvent(EventType.OnLockRecord,inst);
		this.endEventTransaction(EventType.OnLockRecord,success);

		if (!success)
			return(false);

		return(this.model.lock());
	}

	public async validateField(inst?:FieldInstance, value?:any) : Promise<boolean>
	{
		await this.setEventTransaction(EventType.WhenValidateField);
		let success:boolean = await this.fireFieldEvent(EventType.WhenValidateField,inst);
		this.endEventTransaction(EventType.WhenValidateField,success);

		if (success)
			this.model$.setValue(inst.name,value);

		return(success);
	}

	public async validateRow() : Promise<boolean>
	{
		if (this.model.querymode) return(true);
		if (!this.getCurrentRow().exist) return(true);
		if (this.getCurrentRow().validated) return(true);

		if (!await this.current.field.validate(this.current))
			return(false);

		if (this.current.field.block.model.ctrlblk)
			return(true);

		return(this.getRow(this.row).validate());
	}

	public async validateBlock() : Promise<boolean>
	{
		return(this.validateRow());
	}

	public set validated(flag:boolean)
	{
		this.getRow(this.row).validated = flag;
	}

	public get validated() : boolean
	{
		return(this.getRow(this.row).validated);
	}

	public reset(props:boolean, rewind:boolean) : void
	{
		this.current = null;
		this.displayed$.clear();
		if (rewind) this.row$ = -1;
		if (props) this.recprops$.clear();
		this.rows$.forEach((row) => {row.status = Status.na});
	}

	public addInstance(inst:FieldInstance) : void
	{
		if (this.fieldnames$.indexOf(inst.name) < 0)
			this.fieldnames$.push(inst.name);
	}

	public async onTyping(inst:FieldInstance) : Promise<boolean>
	{
		this.curinst$ = inst;
		if (!this.lock(inst)) return(false);
		await this.setEventTransaction(EventType.OnTyping);
		let success:boolean = await	this.fireFieldEvent(EventType.OnTyping,inst);
		this.endEventTransaction(EventType.OnTyping,success);
		return(success);
	}

	public async prevrecord() : Promise<boolean>
	{
		return(this.navigateBlock(KeyMap.prevrecord,this.current));
	}

	public async nextrecord() : Promise<boolean>
	{
		return(this.navigateBlock(KeyMap.nextrecord,this.current));
	}

	public async navigateRow(key:KeyMap, inst:FieldInstance) : Promise<boolean>
	{
		let next:FieldInstance = inst;

		switch(key)
		{
			case KeyMap.nextfield :
			{
				next = inst.field.row.nextField(inst);
				break;
			}

			case KeyMap.prevfield :
			{
				next = inst.field.row.prevField(inst);
				break;
			}
		}

		if (next != inst)
			inst.blur();

		next.focus();
		return(true);
	}

	public async navigateBlock(key:KeyMap, inst:FieldInstance) : Promise<boolean>
	{
		let nav:boolean = false;
		let next:FieldInstance = inst;

		if (this.model.querymode)
			return(false);

		if (!await inst.field.validate(inst))
		{
			next.focus();
			return(false);
		}

		switch(key)
		{
			case KeyMap.nextrecord :
			{
				nav = true;
				next = await this.scroll(inst,1);
				break;
			}

			case KeyMap.prevrecord :
			{
				nav = true;
				next = await this.scroll(inst,-1);
				break;
			}

			case KeyMap.pageup :
			{
				nav = true;
				next = await this.scroll(inst,-this.rows);
				break;
			}

			case KeyMap.pagedown :
			{
				nav = true;
				next = await this.scroll(inst,this.rows);
				break;
			}
		}

		if (next != inst)
			inst.blur();

		next.focus();
		return(nav);
	}

	public offset(inst:FieldInstance) : number
	{
		let row:number = inst.row;
		if (row < 0) row = this.row;
		return(row-this.row$);
	}

	public move(delta:number) : number
	{
		this.row$ = this.row + delta;
		return(this.row$);
	}

	public getCurrentRow() : Row
	{
		return(this.rows$.get(this.row));
	}

	public setCurrentRow(rownum:number) : void
	{
		if (this.row$ < 0)
		{
			this.row$ = 0;

			if (rownum > 0)
				this.row$ = rownum;

			if (this.getRow(this.row).status != Status.na)
			{
				this.openrow();
				this.displaycurrent();
				this.model.queryDetails();
			}

			this.setIndicators(null,rownum);

			return;
		}

		if (rownum == this.row || rownum == -1)
			return;

		this.model$.move(rownum-this.row);
		this.setIndicators(this.row$,rownum);

		let prev:Row = this.getRow(this.row);

		if (prev.status != Status.na)
			prev.setFieldState(FieldState.READONLY);

		this.row$ = rownum;

		if (this.getRow(this.row).status != Status.na)
		{
			this.openrow();
			this.model.queryDetails();
		}

		this.displaycurrent();
	}

	public addRow(row:Row) : void
	{
		this.rows$.set(row.rownum,row);
	}

	public getRow(rownum:number) : Row
	{
		return(this.rows$.get(rownum));
	}

	public displayed(record:Record) : Row
	{
		return(this.displayed$.get(record.id));
	}

	public display(rownum:number, record:Record) : void
	{
		let row:Row = this.getRow(rownum);
		this.displayed$.set(record.id,row);

		if (row.getFieldState() == FieldState.DISABLED)
			row.setFieldState(FieldState.READONLY);

		row.status = this.convert(record.status);

		row.clear();
		this.applyRecordProperties(record,true);

		record.values.forEach((field) =>
		{row.distribute(field.name,field.value,false)});
	}

	public lockUnused()
	{
		let row:Row = this.getRow(0);

		if (this.getCurrentRow().status == Status.na)
		{
			let curr:Row = this.getRow(-1);

			if (curr != null)
			{
				curr.clear();
				curr.setFieldState(FieldState.READONLY);
			}
		}

		if (row.status == Status.na)
		{
			row.clear();
			row.setFieldState(FieldState.READONLY);
		}

		for (let i = 1; i < this.rows; i++)
		{
			row = this.getRow(i);

			if (row.status == Status.na)
			{
				row.clear();
				row.setFieldState(FieldState.DISABLED);
			}
		}
	}

	public refresh(record:Record) : void
	{
		let row:Row = this.displayed(record);
		this.display(row.rownum,record);

		if (row.rownum == this.row)
		{
			this.displaycurrent();
			this.model.queryDetails();
			this.setIndicators(null,this.row);
		}
	}

	public openrow()
	{
		let row:Row = this.getRow(this.row);
		let current:Row = this.rows$.get(-1);

		if (row.getFieldState() == FieldState.READONLY)
		{
			row.setFieldState(FieldState.OPEN);

			if (current != null)
			{
				if (current.getFieldState() == FieldState.READONLY)
					current.setFieldState(FieldState.OPEN);
			}
		}
	}

	private displaycurrent() : void
	{
		let current:Row = this.rows$.get(-1);

		if (current != null && this.getCurrentRow().exist)
		{
			let record:Record = this.model.getRecord();
			current.status = this.convert(record.status);

			current.clear();
			this.applyRecordProperties(record,false);
			record.values.forEach((field) => {current.distribute(field.name,field.value,false);});
		}
	}

	private setIndicators(prev:number, next:number) : void
	{
		if (prev == next) prev = null;
		if (next != null) this.getRow(next).activateIndicators(true);
		if (prev != null) this.getRow(prev).activateIndicators(false);
	}

	private async scroll(inst:FieldInstance, scroll:number) : Promise<FieldInstance>
	{
		let next:FieldInstance = inst;

		if (!await this.validateRow())
			return(next);

		if (this.row + scroll < 0 || this.row + scroll >= this.rows)
		{
			let available:number = 0;

			// fetch up from first, down from last
			if (scroll < 0) available = await this.model.prefetch(scroll,-this.row);
			else			available = await this.model.prefetch(scroll,this.rows-this.row-1);

			if (available <= 0) return(next);
			let move:boolean = (scroll > 1 && available <= this.row);

			if (move)
			{
				inst.ignore = "blur";

				let idx:number = this.getCurrentRow().getFieldIndex(inst);
				next = this.getRow(available-1).getFieldByIndex(idx);

				next.ignore = "focus";
			}

			if (!await this.form.LeaveField(inst))
				return(next);

			if (!await this.form.leaveRecord(this))
				return(next);

			this.model.scroll(scroll,this.row);

			await this.form.enterRecord(this,0);
			await this.form.enterField(inst,0);

			if (move)
			{
				this.setIndicators(this.row$,next.row);
				this.row$ = next.row;
			}
			else
			{
				this.setIndicators(this.row$,next.row);
			}

			this.displaycurrent();
			this.model.queryDetails();

			return(next);
		}

		this.getCurrentRow().validate();
		let idx:number = inst.field.row.getFieldIndex(inst);

		if (inst.row < 0)
		{
			if (this.getRow(this.row+scroll).status == Status.na)
				return(inst);

			if (!await this.form.LeaveField(inst))
				return(next);

			if (!await this.form.leaveRecord(this))
				return(next);

			if (!await this.form.enterRecord(this,scroll))
				return(next);

			if (!await this.form.enterField(inst,scroll))
				return(next);

			this.setCurrentRow(this.row+scroll);
		}
		else
		{
			let row:Row = this.getRow(this.row+scroll);
			if (row.status != Status.na) next = row.getFieldByIndex(idx);
		}

		return(next);
	}

	public findFirst(record:Record) : FieldInstance
	{
		let inst:FieldInstance = null;
		let row:Row = this.displayed(record);
		let curr:boolean = this.current.row < 0;
		let status:Status = this.convert(record.status);

		if (curr)
		{
			inst = this.getRow(-1).getFirstInstance(status);
			if (inst == null) inst = row.getFirstInstance(status);
		}
		else
		{
			inst = row.getFirstInstance(status);
			if (inst == null) inst = this.getRow(-1).getFirstInstance(status);
		}

		return(inst);
	}

	public findFirstEditable(record:Record) : FieldInstance
	{
		let inst:FieldInstance = null;
		let row:Row = this.displayed(record);
		let curr:boolean = this.current.row < 0;
		let status:Status = this.convert(record.status);

		if (curr)
		{
			inst = this.getRow(-1).getFirstEditableInstance(status);
			if (inst == null) inst = row.getFirstEditableInstance(status);
		}
		else
		{
			inst = row.getFirstEditableInstance(status);
			if (inst == null) inst = this.getRow(-1).getFirstEditableInstance(status);
		}

		return(inst);
	}

	public finalize() : void
	{
		let rows:Row[] = [];
		this.rows$.forEach((row) => {rows.push(row)});
		this.form.getIndicators(this.name).forEach((ind) => this.getRow(ind.row)?.setIndicator(ind));

		/*
		 * If only 1 row, set rownum to 0;
		 * Otherwise sort all rows and re-number then from 0 - rows
		*/

		if (rows.length == 1)
			rows[0].rownum = 0;

		if (rows.length > 1)
		{
			let n:number = 0;
			rows = rows.sort((r1,r2) => {return(r1.rownum - r2.rownum)});

			for (let i = 0; i < rows.length; i++)
			{
				if (rows[i].rownum >= 0)
					rows[i].rownum = n++;
			}
		}

		this.rows$.clear();

		rows.forEach((row) =>
		{this.rows$.set(row.rownum,row)});

		this.rc$ = rows.length;
		if (this.getRow(-1) != null) this.rc$--;

		this.rows$.forEach((row) =>
		{
			row.finalize();

			if (row.rownum > 0)
				row.setFieldState(FieldState.DISABLED);
		});

		this.setIndicators(null,0);
		this.getRow(0)?.setFieldState(FieldState.READONLY);
		this.getRow(-1)?.setFieldState(FieldState.READONLY);

		// set most restrictive datatype
		this.getFieldNames().forEach((name) =>
		{
			let diff:boolean = false;
			let type:DataType = null;

			this.getAllFields(name).forEach((fld) =>
			{
				if (type == null)
					type = fld.getInstance(0).datatype;

				fld.getInstances().forEach((inst) =>
				{
					if (inst.datatype != type)
					{
						switch(type)
						{
							case DataType.string :
							{
								if (inst.datatype != DataType.string)
								{
									diff = true;
									type = inst.datatype;
								}
							}
							break;

							case DataType.integer :
							{
								if (inst.datatype != DataType.integer)
									diff = true;
							}
							break;

							case DataType.decimal :
							{
								if (inst.datatype != DataType.integer)
									type = DataType.integer;

								if (inst.datatype != DataType.decimal)
									diff = true;
							}
							break;

							case DataType.date :
							case DataType.datetime :
							{
								if (inst.datatype == DataType.string)
									diff = true;

								if (inst.datatype == DataType.integer)
									diff = true;

								if (inst.datatype == DataType.decimal)
									diff = true;
							} break;
						}
					}
				})
			});

			if (diff)
			{
				this.getAllFields(name).forEach((fld) =>
				{
					fld.getInstances().forEach((inst) =>
					{
						inst.datatype = type;
						inst.defaultProperties.setType(type);
						FieldFeatureFactory.applyType(inst);
					});
				});
			}
		});

		this.model$ = FormBacking.getModelForm(this.form.parent).getBlock(this.name);
	}

	public distribute(field:Field, value:any, dirty:boolean) : void
	{
		let cr:number = this.row$;
		let fr:number = field.row.rownum;

		if (fr >= 0) this.getRow(-1)?.distribute(field.name,value,dirty);
		else		 this.getRow(cr)?.distribute(field.name,value,dirty);
	}

	public convert(status:RecordStatus) : Status
	{
		switch(status)
		{
			case RecordStatus.New 		: return(Status.new);
			case RecordStatus.QBE 		: return(Status.qbe);
			case RecordStatus.Query 	: return(Status.update);
			case RecordStatus.Updated 	: return(Status.update);
			case RecordStatus.Inserted 	: return(Status.insert);
		}
	}

	public linkModel() : void
	{
		this.model$ = FormBacking.getModelForm(this.form.parent).getBlock(this.name);
	}

	private async fireFieldEvent(type:EventType, inst:FieldInstance) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.FieldEvent(type,inst);
		return(FormEvents.raise(frmevent));
	}
}
