/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Form } from './Form.js';
import { Record } from './Record.js';
import { Status } from '../view/Row.js';
import { MSGGRP } from '../messages/Internal.js';
import { ListOfValues } from './ListOfValues.js';
import { Messages } from '../messages/Messages.js';
import { DateConstraint } from './DateConstraint.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { Block as ViewBlock } from '../view/Block.js';
import { FieldProperties } from './FieldProperties.js';
import { TriggerFunction } from './TriggerFunction.js';
import { Block as ModelBlock } from '../model/Block.js';
import { EventType } from '../control/events/EventType.js';
import { FormBacking } from '../application/FormBacking.js';
import { FormEvents } from '../control/events/FormEvents.js';
import { FilterStructure } from '../model/FilterStructure.js';
import { FlushStrategy, FormsModule } from '../application/FormsModule.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';
import { Record as ModelRecord, RecordState } from '../model/Record.js';

/**
 * Intersection between datasource and html elements
 *
 * All generic code for a block should be put here, ie
 * 	Lookups
 * 	Triggers
 * 	List of values
 * 	etc
 */
export class Block
{
	private form$:Form = null;
	private name$:string = null;
	private flush$:FlushStrategy = null;
	private updateallowed$:boolean = true;

	/** Allow Query By Example */
	public qbeallowed:boolean = true;

	/** Can block be queried */
	public queryallowed:boolean = true;

	/** Is insert allowed */
	public insertallowed:boolean = true;

	/** Is delete allowed */
	public deleteallowed:boolean = true;

	/**
	 * @param form : The form to attach to
	 * @param name : The name of the block, used for binding elements
	 */
	constructor(form:Form, name:string)
	{
		this.form$ = form;
		this.name$ = name?.toLowerCase();
		FormBacking.getModelBlock(this,true);
		this.flush$ = FormsModule.defaultFlushStrategy;
		FormBacking.getBacking(form).blocks.set(this.name$,this);
	}

	/**
   * Gets the form associated with the block.
   * 
   * @returns The associated form.
   */
	public get form() : Form
	{
		return(this.form$);
	}

	/**
   * Gets the name of the block.
   * 
   * @returns The name of the block.
   */
	public get name() : string
	{
		return(this.name$);
	}

	/** Is update allowed *
	* 
   * @returns Whether update is allowed.
   */
	public get updateallowed() : boolean
	{
		return(this.updateallowed$);
	}

	/** Is update allowed *
	* 
   * @param flag - The flag to set.
   */
	public set updateallowed(flag:boolean)
	{
		this.updateallowed$ = flag;
		let blk:ViewBlock = FormBacking.getViewBlock(this);

		if (blk)
		{
			if (flag) blk.enableUpdate();
			else		 blk.disableUpdate();
		}
	}

	/** Flush when leaving row or block
	* 
   * @returns The flush strategy.
   */
	public get flushStrategy() : FlushStrategy
	{
		return(this.flush$);
	}

	/** Flush when leaving row or block * 
	* 
   * @param strategy - The flush strategy to set.
   */
	public set flushStrategy(strategy:FlushStrategy)
	{
		this.flush$ = strategy;
	}

	/** The dynamic query filters applied to this block 
 	* 
   * @returns The filter structure.
   */
	public get filter() : FilterStructure
	{
		return(FormBacking.getModelBlock(this).QueryFilter);
	}

	/** Current row number in block  * 
	* 
   * @returns The current row number.
   */
	public get row() : number
	{
		return(FormBacking.getViewBlock(this).row);
	}

	/** Number of displayed rows in block * 
	*
   * @returns The number of displayed rows.
   */
	public get rows() : number
	{
		return(FormBacking.getViewBlock(this).rows);
	}

	/** Sets focus on this block.
   * 
   * @returns A promise resolving to a boolean indicating success.
   */
	public async focus() : Promise<boolean>
	{
		return(FormBacking.getViewBlock(this).focus());
	}

	/** Current record number in block * 
   *
	* @returns The current record number.
   */
	public get record() : number
	{
		return(FormBacking.getModelBlock(this).record);
	}

	/** The state of the current record   *
   * 
   * @returns The state of the current record.
   */
	public get state() : RecordState
	{
		return(this.getRecord()?.state);
	}

	/** Get all field names 
	*
	* @returns An array of field names.
   */
	public get fields() : string[]
	{
		return(FormBacking.getViewBlock(this).getFieldNames());
	}

	/** Flush changes to backend  
	*
   */
	public flush() : void
	{
		FormBacking.getModelBlock(this).flush();
	}

	/** Clear the block. If force, no validation will take place    * 
	* 
   * @param force - Whether to force clearing without validation.
   * @returns A promise resolving to a boolean indicating success.
   */
	public async clear(force?:boolean) : Promise<boolean>
	{
		return(FormBacking.getModelBlock(this).clear(!force));
	}

	/** Is the block in query mode 
   *
	* @returns Whether the block is in query mode.
   */
	public queryMode() : boolean
	{
		return(FormBacking.getModelBlock(this).querymode);
	}

	/** Is the block empty
	* 
   * @returns Whether the block is empty.
   */
	public empty() : boolean
	{
		return(FormBacking.getModelBlock(this).empty);
	}

	/** Refresh (re-query) the record
	* 
   * @param offset - Offset to the current record. 
	*/
	public async refresh(offset?:number) : Promise<void>
	{
		if (offset == null) offset = 0;
		await FormBacking.getModelBlock(this).refresh(offset,true);
	}

	/** Is field bound to this block 
	* 
   * @param name - The name of the field.
   * @returns Whether the field is bound to this block.
   */
	public hasField(name:string) : boolean
	{
		return(this.fields.includes(name?.toLowerCase()));
	}

	/** Show the datepicker for the specified field 
	* 
	* @param field - The name of the field for which the date picker should be displayed.
   * @param row - Optional parameter specifying the row number.
   */
	public showDatePicker(field:string, row?:number) : void
	{
		field = field?.toLowerCase();
		FormBacking.getViewForm(this.form).showDatePicker(this.name,field,row);
	}

	/** Show the LOV associated with the field. 
	* Normally only 1 LOV can be active, force overrules this rule 
	*
 	* @param field - The name of the field for which the LOV should be displayed.
   * @param row - Optional parameter specifying the row number.
	*/
	public showListOfValues(field:string, row?:number) : void
	{
		field = field?.toLowerCase();
		FormBacking.getViewForm(this.form).showListOfValues(this.name,field,row);
	}

	/**
   * Simulates a keystroke.
   * @param key - The keystroke to simulate.
   * @param field - Optional parameter specifying the field from which the keystroke is sent.
   * @param clazz - Optional parameter narrowing down to a specific field class.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
	public async sendkey(key:KeyMap, field?:string, clazz?:string) : Promise<boolean>
	{
		return(this.form.sendkey(key,this.name,field,clazz));
	}

	/**
   * Performs the query details operation.
   * @param field - Optional parameter specifying the field for which details should be queried.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
	public async querydetails(field?:string) : Promise<boolean>
	{
		if (!field) return(FormBacking.getModelBlock(this).queryDetails(true));
		else return(FormBacking.getModelForm(this.form).queryFieldDetails(this.name,field));
	}

	/**
   * Navigates to the previous record.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
	public async prevrecord() : Promise<boolean>
	{
		return(FormBacking.getViewBlock(this).prevrecord());
	}

	/** Navigates to the next record.
	* 
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
	public async nextrecord() : Promise<boolean>
	{
		return(FormBacking.getViewBlock(this).nextrecord());
	}

	/** Navigates to a specific row.
   * 
   * @param row - The row number to navigate to.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
	public async goRow(row:number) : Promise<boolean>
	{
		return(FormBacking.getViewBlock(this).goRow(row));
	}

	/** Navigate to field 
	*
	* @param field - The name of the field to navigate to.
 	* @param clazz - Optional parameter narrowing down to a specific field class.
 	* @returns A promise that resolves to a boolean indicating the success of the operation.
 	*/
	public async goField(field:string, clazz?:string) : Promise<boolean>
	{
		return(FormBacking.getViewBlock(this).goField(field,clazz));
	}

	/** Is this a control block (not bound to a datasource)
	*   
	* @returns A boolean indicating whether the block is a control block.
 	*/
	public isControlBlock() : boolean
	{
		return(FormBacking.getModelBlock(this).ctrlblk);
	}

	/** Get the LOV for the given block and field
	*   
	* @param field - The name of the field for which the LOV is retrieved.
 	* @returns The List of Values (LOV) associated with the specified field.
 	*/
	public getListOfValues(field:string) : ListOfValues
	{
		return(FormBacking.getBacking(this.form).getListOfValues(this.name,field));
	}

	/** Bind LOV to field(s) 
	* 
	* @param lov - The List of Values (LOV) to bind.
 	* @param field - The name of the field or an array of field names to bind the LOV to.
	*/
	public setListOfValues(lov:ListOfValues, field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this.form).setListOfValues(this.name,field[i],lov);
	}

	/** Remove LOV from field(s) 
	* 
	* @param field - The name of the field or an array of field names to remove the LOV from.
 	*/
	public removeListOfValues(field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this.form).removeListOfValues(this.name,field[i]);
	}

	/** Specify a constraint on possible valid dates
	*  
	* @param constraint - The date constraint to apply.
	* @param field - The name of the field or an array of field names to apply the constraint to.
	*/
	public setDateConstraint(constraint:DateConstraint, field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this.form).setDateConstraint(this.name,field[i],constraint);
	}

	/** Get data from datasource
	*  
	* @param header: include column names 
	* @param all: fetch all data from datasource
	* @returns A promise that resolves to a two-dimensional array representing the data. 
	*/
	public async getSourceData(header?:boolean, all?:boolean) : Promise<any[][]>
	{
		return(FormBacking.getModelBlock(this).copy(all,header));
	}

	/** As getSourceData but copies the data to the clipboard. Requires https */
	public async saveDataToClipBoard(header?:boolean, all?:boolean) : Promise<void>
	{
		let str:string = "";
		let data:string[][] = await this.getSourceData(header,all);

		data.forEach((rec) =>
		{
			let row:string = "";
			rec.forEach((col) => {row += ", "+col})
			str += row.substring(2)+"\n";
		})

		str = str.substring(0,str.length-1);
		navigator.clipboard.writeText(str);
	}

	/** Gets the datasource associated with the model block.
	* 
	* @returns The datasource associated with the model block.
	*/
	public get datasource() : DataSource
	{
		return(FormBacking.getModelBlock(this,true).datasource);
	}

	/** Sets the datasource for the model block.
	* 
	* @param source - The new datasource to set.
	*/
	public set datasource(source:DataSource)
	{
		FormBacking.getModelBlock(this,true).datasource = source;
	}

	/** Delete the current record
	*  
	* @returns A promise that resolves to a boolean indicating the success of the operation.
 	*/
	public async delete() : Promise<boolean>
	{
		return(FormBacking.getModelBlock(this)?.delete());
	}

	/** Insert a blank record
	*
	* @param before: Insert above the current row 
	* @returns A promise that resolves to a boolean indicating the success of the operation.
	*/
	public async insert(before?:boolean) : Promise<boolean>
	{
		return(FormBacking.getModelBlock(this)?.insert(before));
	}

	/** Gets the value of a field from the current record.
	* 
	* @param field - The name of the field to retrieve the value from.
	* @returns The value of the specified field in the current record.
	*/
	public getValue(field:string) : any
	{
		return(this.getRecord()?.getValue(field));
	}

	/**  Sets the value of a field in the current record.
	*
	* @param field - The name of the field to set the value for.
	* @param value - The new value to set for the field.
	*/
	public setValue(field:string, value:any) : void
	{
		this.getRecord()?.setValue(field,value);
	}

	/** Is the block in a valid state 
	* 
	* @param field - The name of the field to check the validity for.
 	* @returns A boolean indicating whether the block is in a valid state for the specified field.
 	*/
	public isValid(field:string) : boolean
	{
		return(FormBacking.getViewBlock(this).isValid(field));
	}

	/** Mark the field valid
	*  
	* @param field - The name of the field to mark as valid or invalid.
 	* @param flag - A boolean flag indicating whether to mark the field as valid or invalid.
 	*/
	public setValid(field:string, flag:boolean) : void
	{
		FormBacking.getViewBlock(this).setValid(field,flag);
	}

	/** Gets the name of the current field in the view block.
	* 
	* @returns The name of the current field.
	*/
	public getCurrentField() : string
	{
		return(FormBacking.getViewBlock(this).current.name);
	}

	/** Is block synchronized with backend 
	* 
	* @returns A boolean indicating whether the block has pending changes. 
	*/
	public hasPendingChanges() : boolean
	{
		return(FormBacking.getModelBlock(this).getPendingCount() > 0);
	}

	/** Show the last query for this block 
	*/
	public showLastQuery() : void
	{
		FormBacking.getModelBlock(this).showLastQuery();
	}

	/** setAndValidate field value as if changed by a user (fire all events) 
	* 
	* @param field - The name of the field to set and validate.
	* @param value - The new value to set for the field.
	* @returns A promise that resolves to a boolean indicating the success of the operation.
	*/
	public async setAndValidate(field:string, value:any) : Promise<boolean>
	{
		return(this.getRecord().setAndValidate(field,value));
	}

	/** Lock current record 
	* 
	* @returns A promise that resolves when the record is successfully locked.
	*/
	public async lock() : Promise<void>
	{
		this.getRecord().lock();
	}

	/** Mark the current record as dirty 
	* 
	* @param field - Optional parameter specifying the field to mark as dirty.
	*/
	public setDirty(field?:string) : void
	{
		this.getRecord().setDirty(field);
	}


	/**  Gets the record associated with the specified offset.
	*
	* @param offset - The offset to retrieve the record from. Default is 0.
	* @returns The record associated with the specified offset.
	*/
	public getRecord(offset?:number) : Record
	{
		let intrec:ModelRecord = null;
		if (offset == null) offset = 0;

		let block:ModelBlock = FormBacking.getModelBlock(this);

		if (!FormBacking.getModelForm(this.form).hasEventTransaction(block))
		{
			intrec = block.getRecord(offset);
		}
		else
		{
			if (offset != 0)
			{
				let running:EventType = FormBacking.getModelForm(this.form).eventTransaction.getEvent(block);
				// During transaction, only current record ...
				Messages.severe(MSGGRP.FRAMEWORK,16,EventType[running]);
				return(null);
			}

			intrec = FormBacking.getModelForm(this.form).eventTransaction.getRecord(block);
		}

		return(intrec == null ? null : new Record(intrec));
	}

	/** Rehash the fields. Typically after dynamic insert/delete of HTML elements 
	*/
	public reIndexFieldOrder() : void
	{
		FormBacking.getViewForm(this.form).rehash(this.name);
	}

	/** Get properties used in Query By Example mode 
	* 
	* @param field - The name of the field to retrieve QBE properties for.
	* @returns The properties used in QBE mode for the specified field, or `null` if not found.
	*/
	public getQBEProperties(field:string) : FieldProperties
	{
		field = field?.toLowerCase();
		let inst:FieldInstance[] = FormBacking.getViewBlock(this).getFields(field);
		if (inst.length > 0) return(new FieldProperties(inst[0].qbeProperties));
		return(null);
	}

	/** Get properties used in insert mode 
	* 
	* @param field - The name of the field to retrieve insert mode properties for.
	* @returns The properties used in insert mode for the specified field, or `null` if not found.
	*/
	public getInsertProperties(field:string) : FieldProperties
	{
		field = field?.toLowerCase();
		let inst:FieldInstance[] = FormBacking.getViewBlock(this).getFields(field);
		if (inst.length > 0) return(new FieldProperties(inst[0].insertProperties));
		return(null);
	}

	/** Get properties used in display mode 
	*
	* @param field - The name of the field to retrieve display mode properties for.
	* @returns The properties used in display mode for the specified field, or `null` if not found.
	*/ 
	public getDefaultProperties(field:string) : FieldProperties
	{
		field = field?.toLowerCase();
		let inst:FieldInstance[] = FormBacking.getViewBlock(this).getFields(field);
		if (inst.length > 0) return(new FieldProperties(inst[0].updateProperties));
		return(null);
	}

	/** As in getQBEProperties, but narrow down on the field id 
	*
	* @param field - The name of the field to retrieve QBE properties for.
	* @param id - The ID of the field to narrow down the search.
	* @returns The properties used in QBE mode for the specified field ID, or `null` if not found.
	*/
	public getQBEPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.qbeProperties));
		return(null);
	}

	/** As in getInsertProperties, but narrow down on the field id
	*
	* @param field - The name of the field to retrieve insert mode properties for.
	* @param id - The ID of the field to narrow down the search.
	* @returns The properties used in insert mode for the specified field ID, or `null` if not found.
	*/
	public getInsertPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.insertProperties));
		return(null);
	}

	/** As in getDefaultProperties, but narrow down on the field id 
	*
	* @param field - The name of the field to retrieve display mode properties for.
	* @param id - The ID of the field to narrow down the search.
	* @returns The properties used in display mode for the specified field ID, or `null` if not found.
	*/
	public getDefaultPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.updateProperties));
		return(null);
	}

	/** As in getQBEProperties, but narrow down on a given class */
	public getQBEPropertiesByClass(field:string, clazz?:string) : FieldProperties
	{
		let props:FieldProperties[] = this.getAllQBEPropertiesByClass(field,clazz);
		return(props.length == 0 ? null : props[0])
	}

	/** As in getInsertProperties, but narrow down a given class 
	* 
	* @param field - The name of the field to retrieve QBE properties for.
	* @param clazz - The class to narrow down the search.
	* @returns The properties used in QBE mode for the specified class, or `null` if not found.
	*/
	public getInsertPropertiesByClass(field:string, clazz?:string) : FieldProperties
	{
		let props:FieldProperties[] = this.getAllInsertPropertiesByClass(field,clazz);
		return(props.length == 0 ? null : props[0])
	}

	/** As in getDefaultProperties, but narrow down a given class 
	* 
	* @param field - The name of the field to retrieve insert mode properties for.
	* @param clazz - The class to narrow down the search.
	* @returns The properties used in insert mode for the specified class, or `null` if not found.
	*/
	public getDefaultPropertiesByClass(field:string, clazz?:string) : FieldProperties
	{
		let props:FieldProperties[] = this.getAllDefaultPropertiesByClass(field,clazz);
		return(props.length == 0 ? null : props[0])
	}

	/** Get properties for all fields in Query By Example mode 
	*
	* @param field - The name of the field to retrieve QBE properties for.
	* @param clazz - The class to narrow down the search.
	* @returns An array of properties used in QBE mode for all fields with the specified class.
	*/
	public getAllQBEPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.qbeProperties))})
		return(props);
	}

	/** Get properties for all fields in insert mode 
	*
	* @param field - The name of the field to retrieve insert mode properties for.
	* @param clazz - The class to narrow down the search.
	* @returns An array of properties used in insert mode for all fields with the specified class.
	*/
	public getAllInsertPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.insertProperties))})
		return(props);
	}

	/** Get properties for all fields in display mode 
	* 
	* @param field - The name of the field to retrieve display mode properties for.
	* @param clazz - The class to narrow down the search.
	* @returns An array of properties used in display mode for all fields with the specified class.
	*/
	public getAllDefaultPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.updateProperties))})
		return(props);
	}

	/** Apply Query By Example (QBE) properties to field
	* 
	* @param props - The QBE properties to apply.
	* @param field - The name of the field to apply QBE properties to.
	* @param clazz - The class to narrow down the fields.
	*/
	public setQBEProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.qbe);})
	}

	/** Apply insert properties to field 
	* 
	* @param props - The insert properties to apply.
	* @param field - The name of the field to apply insert properties to.
	* @param clazz -  narrow down on class
	*/
	public setInsertProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.insert);})
	}

	/** Apply display properties to field
	* 
	* @param props - The display properties to apply.
 	* @param field - The name of the field to apply display properties to.
	* @param clazz - narrow down on class 
	*/
	public setDefaultProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		FormBacking.getViewBlock(this).getInstancesByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.update);})
	}

	/** Apply Query By Example properties to field param class - narrow down on id 
	* 
	* @param props - The QBE properties to apply.
 	* @param field - The name of the field to apply QBE properties to.
 	* @param id - The ID of the field to narrow down the search.
	*/
	public setQBEPropertiesById(props:FieldProperties, field:string, id:string) : void
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		FieldFeatureFactory.replace(props,inst,Status.qbe);
	}

	/** Apply insert properties to field param class - narrow down on id 
	* 
	* @param props - The insert properties to apply.
	* @param field - The name of the field to apply insert properties to.
	* @param id - The ID of the field to narrow down the search.
	*/
	public setInsertPropertiesById(props:FieldProperties, field:string, id:string) : void
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		FieldFeatureFactory.replace(props,inst,Status.insert);
	}

	/** Apply display properties to field param clazz: narrow down on id 
	* 
	* @param props - The display properties to apply.
	* @param field - The name of the field to apply display properties to.
	* @param id - The ID of the field to narrow down the search.
	*/
	public setDefaultPropertiesById(props:FieldProperties, field:string, id:string) : void
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = FormBacking.getViewBlock(this).getFieldById(field,id);
		FieldFeatureFactory.replace(props,inst,Status.update);
	}

	/** Re query the block with current filters 
	* 
	* This method triggers a requery operation on the block, refreshing the data based on the current filters.
   *
	* @returns A Promise that resolves to `true` if the requery is successful, otherwise `false`.
	*/
	public async reQuery() : Promise<boolean>
	{
		return(FormBacking.getModelForm(this.form).executeQuery(this.name,true,true));
	}

	/** Escape Query By Example mode 
	*
	* This method cancels the Query By Example mode for the block, allowing the user to return to the regular mode.
	*/
	public cancelQueryMode() : void
	{
		FormBacking.getModelForm(this.form).cancelQueryMode(this.name);
	}

	/** Enter Query By Example mode 
	* 
	* This method activates the Query By Example mode for the block, allowing the user to perform queries based on example values.
	*
	* @returns A Promise that resolves to `true` if entering QBE mode is successful, otherwise `false`.
	*/
	public async enterQueryMode() : Promise<boolean>
	{
		return(FormBacking.getModelForm(this.form).enterQuery(this.name));
	}

	/** Executes a query on the block.
	* 
	* This method initiates the execution of a query on the block, retrieving and displaying the results.
	*
	* @returns A Promise that resolves to `true` if the query execution is successful, otherwise `false`.
	*/
	public async executeQuery() : Promise<boolean>
	{
		return(FormBacking.getModelForm(this.form).executeQuery(this.name,false,true));
	}

	/** Remove event listener 
	* 
	* @param handle - the handle returned when applying the event listener 
	*/
	public removeEventListener(handle:object) : void
	{
		FormEvents.removeListener(handle);
	}

	/** Apply event listener. 
	* 
	* @param method - The trigger function to be executed when the event occurs.
	* @param filter - A filter on the event (optional).
	* @returns An object representing the handle for the applied event listener.
	*/
	public addEventListener(method:TriggerFunction, filter?:EventFilter|EventFilter[]) : object
	{
		if (!filter) filter = {} as EventFilter;
		(filter as EventFilter).block = this.name;
		return(FormEvents.addListener(this.form,this,method,filter));
	}

	/** Dump the fetched records to the console 
	* 
	*/
	public dump() : void
	{
		FormBacking.getModelBlock(this).wrapper.dump();
	}
}