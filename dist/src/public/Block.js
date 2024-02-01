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
import { Record } from './Record.js';
import { Status } from '../view/Row.js';
import { MSGGRP } from '../messages/Internal.js';
import { Messages } from '../messages/Messages.js';
import { FieldProperties } from './FieldProperties.js';
import { EventType } from '../control/events/EventType.js';
import { FormBacking } from '../application/FormBacking.js';
import { FormEvents } from '../control/events/FormEvents.js';
import { FormsModule } from '../application/FormsModule.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';
/**
 * Intersection between datasource and html elements
 *
 * All generic code for a block should be put here, ie
 * 	Lookups
 * 	Triggers
 * 	List of values
 * 	etc
 */
export class Block {
    form$ = null;
    name$ = null;
    flush$ = null;
    updateallowed$ = true;
    /** Allow Query By Example */
    qbeallowed = true;
    /** Can block be queried */
    queryallowed = true;
    /** Is insert allowed */
    insertallowed = true;
    /** Is delete allowed */
    deleteallowed = true;
    /**
     * @param form : The form to attach to
     * @param name : The name of the block, used for binding elements
     */
    constructor(form, name) {
        this.form$ = form;
        this.name$ = name?.toLowerCase();
        FormBacking.getModelBlock(this, true);
        this.flush$ = FormsModule.defaultFlushStrategy;
        FormBacking.getBacking(form).blocks.set(this.name$, this);
    }
    /**
   * Gets the form associated with the block.
   *
   * @returns The associated form.
   */
    get form() {
        return (this.form$);
    }
    /**
   * Gets the name of the block.
   *
   * @returns The name of the block.
   */
    get name() {
        return (this.name$);
    }
    /** Is update allowed *
    *
   * @returns Whether update is allowed.
   */
    get updateallowed() {
        return (this.updateallowed$);
    }
    /** Is update allowed *
    *
   * @param flag - The flag to set.
   */
    set updateallowed(flag) {
        this.updateallowed$ = flag;
        let blk = FormBacking.getViewBlock(this);
        if (blk) {
            if (flag)
                blk.enableUpdate();
            else
                blk.disableUpdate();
        }
    }
    /** Flush when leaving row or block
    *
   * @returns The flush strategy.
   */
    get flushStrategy() {
        return (this.flush$);
    }
    /** Flush when leaving row or block *
    *
   * @param strategy - The flush strategy to set.
   */
    set flushStrategy(strategy) {
        this.flush$ = strategy;
    }
    /** The dynamic query filters applied to this block
    *
   * @returns The filter structure.
   */
    get filter() {
        return (FormBacking.getModelBlock(this).QueryFilter);
    }
    /** Current row number in block  *
    *
   * @returns The current row number.
   */
    get row() {
        return (FormBacking.getViewBlock(this).row);
    }
    /** Number of displayed rows in block *
    *
   * @returns The number of displayed rows.
   */
    get rows() {
        return (FormBacking.getViewBlock(this).rows);
    }
    /** Sets focus on this block.
   *
   * @returns A promise resolving to a boolean indicating success.
   */
    async focus() {
        return (FormBacking.getViewBlock(this).focus());
    }
    /** Current record number in block *
   *
    * @returns The current record number.
   */
    get record() {
        return (FormBacking.getModelBlock(this).record);
    }
    /** The state of the current record   *
   *
   * @returns The state of the current record.
   */
    get state() {
        return (this.getRecord()?.state);
    }
    /** Get all field names
    *
    * @returns An array of field names.
   */
    get fields() {
        return (FormBacking.getViewBlock(this).getFieldNames());
    }
    /** Flush changes to backend
    *
   */
    flush() {
        FormBacking.getModelBlock(this).flush();
    }
    /** Clear the block. If force, no validation will take place    *
    *
   * @param force - Whether to force clearing without validation.
   * @returns A promise resolving to a boolean indicating success.
   */
    async clear(force) {
        return (FormBacking.getModelBlock(this).clear(!force));
    }
    /** Is the block in query mode
   *
    * @returns Whether the block is in query mode.
   */
    queryMode() {
        return (FormBacking.getModelBlock(this).querymode);
    }
    /** Is the block empty
    *
   * @returns Whether the block is empty.
   */
    empty() {
        return (FormBacking.getModelBlock(this).empty);
    }
    /** Refresh (re-query) the record
    *
   * @param offset - Offset to the current record.
    */
    async refresh(offset) {
        if (offset == null)
            offset = 0;
        await FormBacking.getModelBlock(this).refresh(offset, true);
    }
    /** Is field bound to this block
    *
   * @param name - The name of the field.
   * @returns Whether the field is bound to this block.
   */
    hasField(name) {
        return (this.fields.includes(name?.toLowerCase()));
    }
    /** Show the datepicker for the specified field
    *
    * @param field - The name of the field for which the date picker should be displayed.
   * @param row - Optional parameter specifying the row number.
   */
    showDatePicker(field, row) {
        field = field?.toLowerCase();
        FormBacking.getViewForm(this.form).showDatePicker(this.name, field, row);
    }
    /** Show the LOV associated with the field.
    * Normally only 1 LOV can be active, force overrules this rule
    *
    * @param field - The name of the field for which the LOV should be displayed.
   * @param row - Optional parameter specifying the row number.
    */
    showListOfValues(field, row) {
        field = field?.toLowerCase();
        FormBacking.getViewForm(this.form).showListOfValues(this.name, field, row);
    }
    /**
   * Simulates a keystroke.
   * @param key - The keystroke to simulate.
   * @param field - Optional parameter specifying the field from which the keystroke is sent.
   * @param clazz - Optional parameter narrowing down to a specific field class.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    async sendkey(key, field, clazz) {
        return (this.form.sendkey(key, this.name, field, clazz));
    }
    /**
   * Performs the query details operation.
   * @param field - Optional parameter specifying the field for which details should be queried.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    async querydetails(field) {
        if (!field)
            return (FormBacking.getModelBlock(this).queryDetails(true));
        else
            return (FormBacking.getModelForm(this.form).queryFieldDetails(this.name, field));
    }
    /**
   * Navigates to the previous record.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    async prevrecord() {
        return (FormBacking.getViewBlock(this).prevrecord());
    }
    /** Navigates to the next record.
    *
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    async nextrecord() {
        return (FormBacking.getViewBlock(this).nextrecord());
    }
    /** Navigates to a specific row.
   *
   * @param row - The row number to navigate to.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    async goRow(row) {
        return (FormBacking.getViewBlock(this).goRow(row));
    }
    /** Navigate to field
    *
    * @param field - The name of the field to navigate to.
    * @param clazz - Optional parameter narrowing down to a specific field class.
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    async goField(field, clazz) {
        return (FormBacking.getViewBlock(this).goField(field, clazz));
    }
    /** Is this a control block (not bound to a datasource)
    *
    * @returns A boolean indicating whether the block is a control block.
    */
    isControlBlock() {
        return (FormBacking.getModelBlock(this).ctrlblk);
    }
    /** Get the LOV for the given block and field
    *
    * @param field - The name of the field for which the LOV is retrieved.
    * @returns The List of Values (LOV) associated with the specified field.
    */
    getListOfValues(field) {
        return (FormBacking.getBacking(this.form).getListOfValues(this.name, field));
    }
    /** Bind LOV to field(s)
    *
    * @param lov - The List of Values (LOV) to bind.
    * @param field - The name of the field or an array of field names to bind the LOV to.
    */
    setListOfValues(lov, field) {
        if (!Array.isArray(field))
            field = [field];
        for (let i = 0; i < field.length; i++)
            FormBacking.getBacking(this.form).setListOfValues(this.name, field[i], lov);
    }
    /** Remove LOV from field(s)
    *
    * @param field - The name of the field or an array of field names to remove the LOV from.
    */
    removeListOfValues(field) {
        if (!Array.isArray(field))
            field = [field];
        for (let i = 0; i < field.length; i++)
            FormBacking.getBacking(this.form).removeListOfValues(this.name, field[i]);
    }
    /** Specify a constraint on possible valid dates
    *
    * @param constraint - The date constraint to apply.
    * @param field - The name of the field or an array of field names to apply the constraint to.
    */
    setDateConstraint(constraint, field) {
        if (!Array.isArray(field))
            field = [field];
        for (let i = 0; i < field.length; i++)
            FormBacking.getBacking(this.form).setDateConstraint(this.name, field[i], constraint);
    }
    /** Set valid values for a given field */
    setValidValues(field, values) {
        if (!Array.isArray(field))
            field = [field];
        let map = new Map();
        if (Array.isArray(values) || values instanceof Set) {
            values.forEach((value) => { map.set(value, value); });
        }
        else {
            map = values;
        }
        field.forEach((fld) => {
            FormBacking.getViewBlock(this).getInstancesByClass(fld).forEach((inst) => {
                inst.properties.setValidValues(map);
                inst.qbeProperties.setValidValues(map);
                inst.insertProperties.setValidValues(map);
                inst.updateProperties.setValidValues(map);
                inst.defaultProperties.setValidValues(map);
                if (inst.element instanceof HTMLSelectElement)
                    FieldFeatureFactory.setSelectOptions(inst.element, inst.properties);
                if (inst.element instanceof HTMLInputElement)
                    FieldFeatureFactory.createDataList(inst, inst.properties);
            });
        });
    }
    /** Get data from datasource
    *
    * @param header: include column names
    * @param all: fetch all data from datasource
    * @returns A promise that resolves to a two-dimensional array representing the data.
    */
    async getSourceData(header, all) {
        return (FormBacking.getModelBlock(this).copy(all, header));
    }
    /** As getSourceData but copies the data to the clipboard. Requires https */
    async saveDataToClipBoard(header, all) {
        let str = "";
        let data = await this.getSourceData(header, all);
        data.forEach((rec) => {
            let row = "";
            rec.forEach((col) => { row += ", " + col; });
            str += row.substring(2) + "\n";
        });
        str = str.substring(0, str.length - 1);
        navigator.clipboard.writeText(str);
    }
    /** Gets the datasource associated with the model block.
    *
    * @returns The datasource associated with the model block.
    */
    get datasource() {
        return (FormBacking.getModelBlock(this, true).datasource);
    }
    /** Sets the datasource for the model block.
    *
    * @param source - The new datasource to set.
    */
    set datasource(source) {
        FormBacking.getModelBlock(this, true).datasource = source;
    }
    /** Delete the current record
    *
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    async delete() {
        return (FormBacking.getModelBlock(this)?.delete());
    }
    /** Insert a blank record
    *
    * @param before: Insert above the current row
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    async insert(before) {
        return (FormBacking.getModelBlock(this)?.insert(before));
    }
    /** Gets the value of a field from the current record.
    *
    * @param field - The name of the field to retrieve the value from.
    * @returns The value of the specified field in the current record.
    */
    getValue(field) {
        return (this.getRecord()?.getValue(field));
    }
    /**  Sets the value of a field in the current record.
    *
    * @param field - The name of the field to set the value for.
    * @param value - The new value to set for the field.
    */
    setValue(field, value) {
        this.getRecord()?.setValue(field, value);
    }
    /** Is the block in a valid state
    *
    * @param field - The name of the field to check the validity for.
    * @returns A boolean indicating whether the block is in a valid state for the specified field.
    */
    isValid(field) {
        return (FormBacking.getViewBlock(this).isValid(field));
    }
    /** Mark the field valid
    *
    * @param field - The name of the field to mark as valid or invalid.
    * @param flag - A boolean flag indicating whether to mark the field as valid or invalid.
    */
    setValid(field, flag) {
        FormBacking.getViewBlock(this).setValid(field, flag);
    }
    /** Gets the name of the current field in the view block.
    *
    * @returns The name of the current field.
    */
    getCurrentField() {
        return (FormBacking.getViewBlock(this).current.name);
    }
    /** Is block synchronized with backend
    *
    * @returns A boolean indicating whether the block has pending changes.
    */
    hasPendingChanges() {
        return (FormBacking.getModelBlock(this).getPendingCount() > 0);
    }
    /** Show the last query for this block
    */
    showLastQuery() {
        FormBacking.getModelBlock(this).showLastQuery();
    }
    /** setAndValidate field value as if changed by a user (fire all events)
    *
    * @param field - The name of the field to set and validate.
    * @param value - The new value to set for the field.
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    async setAndValidate(field, value) {
        return (this.getRecord().setAndValidate(field, value));
    }
    /** Lock current record
    *
    * @returns A promise that resolves when the record is successfully locked.
    */
    async lock() {
        this.getRecord().lock();
    }
    /** Mark the current record as dirty
    *
    * @param field - Optional parameter specifying the field to mark as dirty.
    */
    setDirty(field) {
        this.getRecord().setDirty(field);
    }
    /**  Gets the record associated with the specified offset.
    *
    * @param offset - The offset to retrieve the record from. Default is 0.
    * @returns The record associated with the specified offset.
    */
    getRecord(offset) {
        let intrec = null;
        if (offset == null)
            offset = 0;
        let block = FormBacking.getModelBlock(this);
        if (!FormBacking.getModelForm(this.form).hasEventTransaction(block)) {
            intrec = block.getRecord(offset);
        }
        else {
            if (offset != 0) {
                let running = FormBacking.getModelForm(this.form).eventTransaction.getEvent(block);
                // During transaction, only current record ...
                Messages.severe(MSGGRP.FRAMEWORK, 16, EventType[running]);
                return (null);
            }
            intrec = FormBacking.getModelForm(this.form).eventTransaction.getRecord(block);
        }
        return (intrec == null ? null : new Record(intrec));
    }
    /** Rehash the fields. Typically after dynamic insert/delete of HTML elements
    */
    reIndexFieldOrder() {
        FormBacking.getViewForm(this.form).rehash(this.name);
    }
    /** Get properties used in Query By Example mode
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @returns The properties used in QBE mode for the specified field, or `null` if not found.
    */
    getQBEProperties(field) {
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFields(field);
        if (inst.length > 0)
            return (new FieldProperties(inst[0].qbeProperties));
        return (null);
    }
    /** Get properties used in insert mode
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @returns The properties used in insert mode for the specified field, or `null` if not found.
    */
    getInsertProperties(field) {
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFields(field);
        if (inst.length > 0)
            return (new FieldProperties(inst[0].insertProperties));
        return (null);
    }
    /** Get properties used in display mode
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @returns The properties used in display mode for the specified field, or `null` if not found.
    */
    getDefaultProperties(field) {
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFields(field);
        if (inst.length > 0)
            return (new FieldProperties(inst[0].updateProperties));
        return (null);
    }
    /** As in getQBEProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in QBE mode for the specified field ID, or `null` if not found.
    */
    getQBEPropertiesById(field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        if (inst != null)
            return (new FieldProperties(inst.qbeProperties));
        return (null);
    }
    /** As in getInsertProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in insert mode for the specified field ID, or `null` if not found.
    */
    getInsertPropertiesById(field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        if (inst != null)
            return (new FieldProperties(inst.insertProperties));
        return (null);
    }
    /** As in getDefaultProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in display mode for the specified field ID, or `null` if not found.
    */
    getDefaultPropertiesById(field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        if (inst != null)
            return (new FieldProperties(inst.updateProperties));
        return (null);
    }
    /** As in getQBEProperties, but narrow down on a given class */
    getQBEPropertiesByClass(field, clazz) {
        let props = this.getAllQBEPropertiesByClass(field, clazz);
        return (props.length == 0 ? null : props[0]);
    }
    /** As in getInsertProperties, but narrow down a given class
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param clazz - The class to narrow down the search.
    * @returns The properties used in QBE mode for the specified class, or `null` if not found.
    */
    getInsertPropertiesByClass(field, clazz) {
        let props = this.getAllInsertPropertiesByClass(field, clazz);
        return (props.length == 0 ? null : props[0]);
    }
    /** As in getDefaultProperties, but narrow down a given class
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns The properties used in insert mode for the specified class, or `null` if not found.
    */
    getDefaultPropertiesByClass(field, clazz) {
        let props = this.getAllDefaultPropertiesByClass(field, clazz);
        return (props.length == 0 ? null : props[0]);
    }
    /** Get properties for all fields in Query By Example mode
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in QBE mode for all fields with the specified class.
    */
    getAllQBEPropertiesByClass(field, clazz) {
        clazz = clazz?.toLowerCase();
        field = field?.toLowerCase();
        let props = [];
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { props.push(new FieldProperties(inst.qbeProperties)); });
        return (props);
    }
    /** Get properties for all fields in insert mode
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in insert mode for all fields with the specified class.
    */
    getAllInsertPropertiesByClass(field, clazz) {
        clazz = clazz?.toLowerCase();
        field = field?.toLowerCase();
        let props = [];
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { props.push(new FieldProperties(inst.insertProperties)); });
        return (props);
    }
    /** Get properties for all fields in display mode
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in display mode for all fields with the specified class.
    */
    getAllDefaultPropertiesByClass(field, clazz) {
        clazz = clazz?.toLowerCase();
        field = field?.toLowerCase();
        let props = [];
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { props.push(new FieldProperties(inst.updateProperties)); });
        return (props);
    }
    /** Apply Query By Example (QBE) properties to field
    *
    * @param props - The QBE properties to apply.
    * @param field - The name of the field to apply QBE properties to.
    * @param clazz - The class to narrow down the fields.
    */
    setQBEProperties(props, field, clazz) {
        field = field?.toLowerCase();
        clazz = clazz?.toLowerCase();
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { FieldFeatureFactory.replace(props, inst, Status.qbe); });
    }
    /** Apply insert properties to field
    *
    * @param props - The insert properties to apply.
    * @param field - The name of the field to apply insert properties to.
    * @param clazz -  narrow down on class
    */
    setInsertProperties(props, field, clazz) {
        field = field?.toLowerCase();
        clazz = clazz?.toLowerCase();
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { FieldFeatureFactory.replace(props, inst, Status.insert); });
    }
    /** Apply display properties to field
    *
    * @param props - The display properties to apply.
    * @param field - The name of the field to apply display properties to.
    * @param clazz - narrow down on class
    */
    setDefaultProperties(props, field, clazz) {
        field = field?.toLowerCase();
        clazz = clazz?.toLowerCase();
        FormBacking.getViewBlock(this).getInstancesByClass(field, clazz).
            forEach((inst) => { FieldFeatureFactory.replace(props, inst, Status.update); });
    }
    /** Apply Query By Example properties to field param class - narrow down on id
    *
    * @param props - The QBE properties to apply.
    * @param field - The name of the field to apply QBE properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setQBEPropertiesById(props, field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        FieldFeatureFactory.replace(props, inst, Status.qbe);
    }
    /** Apply insert properties to field param class - narrow down on id
    *
    * @param props - The insert properties to apply.
    * @param field - The name of the field to apply insert properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setInsertPropertiesById(props, field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        FieldFeatureFactory.replace(props, inst, Status.insert);
    }
    /** Apply display properties to field param clazz: narrow down on id
    *
    * @param props - The display properties to apply.
    * @param field - The name of the field to apply display properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setDefaultPropertiesById(props, field, id) {
        id = id?.toLowerCase();
        field = field?.toLowerCase();
        let inst = FormBacking.getViewBlock(this).getFieldById(field, id);
        FieldFeatureFactory.replace(props, inst, Status.update);
    }
    /** Re query the block with current filters
    *
    * This method triggers a requery operation on the block, refreshing the data based on the current filters.
   *
    * @returns A Promise that resolves to `true` if the requery is successful, otherwise `false`.
    */
    async reQuery() {
        return (FormBacking.getModelForm(this.form).executeQuery(this.name, true, true));
    }
    /** Escape Query By Example mode
    *
    * This method cancels the Query By Example mode for the block, allowing the user to return to the regular mode.
    */
    cancelQueryMode() {
        FormBacking.getModelForm(this.form).cancelQueryMode(this.name);
    }
    /** Enter Query By Example mode
    *
    * This method activates the Query By Example mode for the block, allowing the user to perform queries based on example values.
    *
    * @returns A Promise that resolves to `true` if entering QBE mode is successful, otherwise `false`.
    */
    async enterQueryMode() {
        return (FormBacking.getModelForm(this.form).enterQuery(this.name));
    }
    /** Executes a query on the block.
    *
    * This method initiates the execution of a query on the block, retrieving and displaying the results.
    *
    * @returns A Promise that resolves to `true` if the query execution is successful, otherwise `false`.
    */
    async executeQuery() {
        return (FormBacking.getModelForm(this.form).executeQuery(this.name, false, true));
    }
    /** Remove event listener
    *
    * @param handle - the handle returned when applying the event listener
    */
    removeEventListener(handle) {
        FormEvents.removeListener(handle);
    }
    /** Apply event listener.
    *
    * @param method - The trigger function to be executed when the event occurs.
    * @param filter - A filter on the event (optional).
    * @returns An object representing the handle for the applied event listener.
    */
    addEventListener(method, filter) {
        if (!filter)
            filter = {};
        filter.block = this.name;
        return (FormEvents.addListener(this.form, this, method, filter));
    }
    /** Dump the fetched records to the console
    *
    */
    dump() {
        FormBacking.getModelBlock(this).wrapper.dump();
    }
}
