import { Form } from './Form.js';
import { Record } from './Record.js';
import { ListOfValues } from './ListOfValues.js';
import { DateConstraint } from './DateConstraint.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { FieldProperties } from './FieldProperties.js';
import { TriggerFunction } from './TriggerFunction.js';
import { FilterStructure } from '../model/FilterStructure.js';
import { FlushStrategy } from '../application/FormsModule.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { RecordState } from '../model/Record.js';
/**
 * Intersection between datasource and html elements
 *
 * All generic code for a block should be put here, ie
 * 	Lookups
 * 	Triggers
 * 	List of values
 * 	etc
 */
export declare class Block {
    private form$;
    private name$;
    private flush$;
    private updateallowed$;
    /** Allow Query By Example */
    qbeallowed: boolean;
    /** Can block be queried */
    queryallowed: boolean;
    /** Is insert allowed */
    insertallowed: boolean;
    /** Is delete allowed */
    deleteallowed: boolean;
    /**
     * @param form : The form to attach to
     * @param name : The name of the block, used for binding elements
     */
    constructor(form: Form, name: string);
    /**
   * Gets the form associated with the block.
   *
   * @returns The associated form.
   */
    get form(): Form;
    /**
   * Gets the name of the block.
   *
   * @returns The name of the block.
   */
    get name(): string;
    /** Is update allowed *
    *
   * @returns Whether update is allowed.
   */
    get updateallowed(): boolean;
    /** Is update allowed *
    *
   * @param flag - The flag to set.
   */
    set updateallowed(flag: boolean);
    /** Flush when leaving row or block
    *
   * @returns The flush strategy.
   */
    get flushStrategy(): FlushStrategy;
    /** Flush when leaving row or block *
    *
   * @param strategy - The flush strategy to set.
   */
    set flushStrategy(strategy: FlushStrategy);
    /** The dynamic query filters applied to this block
    *
   * @returns The filter structure.
   */
    get filter(): FilterStructure;
    /** Current row number in block  *
    *
   * @returns The current row number.
   */
    get row(): number;
    /** Number of displayed rows in block *
    *
   * @returns The number of displayed rows.
   */
    get rows(): number;
    /** Sets focus on this block.
   *
   * @returns A promise resolving to a boolean indicating success.
   */
    focus(): Promise<boolean>;
    /** Current record number in block *
   *
    * @returns The current record number.
   */
    get record(): number;
    /** The state of the current record   *
   *
   * @returns The state of the current record.
   */
    get state(): RecordState;
    /** Get all field names
    *
    * @returns An array of field names.
   */
    get fields(): string[];
    /** Flush changes to backend
    *
   */
    flush(): void;
    /** Clear the block. If force, no validation will take place    *
    *
   * @param force - Whether to force clearing without validation.
   * @returns A promise resolving to a boolean indicating success.
   */
    clear(force?: boolean): Promise<boolean>;
    /** Is the block in query mode
   *
    * @returns Whether the block is in query mode.
   */
    queryMode(): boolean;
    /** Is the block empty
    *
   * @returns Whether the block is empty.
   */
    empty(): boolean;
    /** Refresh (re-query) the record
    *
   * @param offset - Offset to the current record.
    */
    refresh(offset?: number): Promise<void>;
    /** Is field bound to this block
    *
   * @param name - The name of the field.
   * @returns Whether the field is bound to this block.
   */
    hasField(name: string): boolean;
    /** Show the datepicker for the specified field
    *
    * @param field - The name of the field for which the date picker should be displayed.
   * @param row - Optional parameter specifying the row number.
   */
    showDatePicker(field: string, row?: number): void;
    /** Show the LOV associated with the field.
    * Normally only 1 LOV can be active, force overrules this rule
    *
    * @param field - The name of the field for which the LOV should be displayed.
   * @param row - Optional parameter specifying the row number.
    */
    showListOfValues(field: string, row?: number): void;
    /**
   * Simulates a keystroke.
   * @param key - The keystroke to simulate.
   * @param field - Optional parameter specifying the field from which the keystroke is sent.
   * @param clazz - Optional parameter narrowing down to a specific field class.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    sendkey(key: KeyMap, field?: string, clazz?: string): Promise<boolean>;
    /**
   * Performs the query details operation.
   * @param field - Optional parameter specifying the field for which details should be queried.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    querydetails(field?: string): Promise<boolean>;
    /**
   * Navigates to the previous record.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    prevrecord(): Promise<boolean>;
    /** Navigates to the next record.
    *
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    nextrecord(): Promise<boolean>;
    /** Navigates to a specific row.
   *
   * @param row - The row number to navigate to.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
    goRow(row: number): Promise<boolean>;
    /** Navigate to field
    *
    * @param field - The name of the field to navigate to.
    * @param clazz - Optional parameter narrowing down to a specific field class.
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    goField(field: string, clazz?: string): Promise<boolean>;
    /** Is this a control block (not bound to a datasource)
    *
    * @returns A boolean indicating whether the block is a control block.
    */
    isControlBlock(): boolean;
    /** Get the LOV for the given block and field
    *
    * @param field - The name of the field for which the LOV is retrieved.
    * @returns The List of Values (LOV) associated with the specified field.
    */
    getListOfValues(field: string): ListOfValues;
    /** Bind LOV to field(s)
    *
    * @param lov - The List of Values (LOV) to bind.
    * @param field - The name of the field or an array of field names to bind the LOV to.
    */
    setListOfValues(lov: ListOfValues, field: string | string[]): void;
    /** Remove LOV from field(s)
    *
    * @param field - The name of the field or an array of field names to remove the LOV from.
    */
    removeListOfValues(field: string | string[]): void;
    /** Specify a constraint on possible valid dates
    *
    * @param constraint - The date constraint to apply.
    * @param field - The name of the field or an array of field names to apply the constraint to.
    */
    setDateConstraint(constraint: DateConstraint, field: string | string[]): void;
    /** Set valid values for a given field */
    setValidValues(field: string | string[], values: string[] | Set<any> | Map<any, any>): void;
    /** Get data from datasource
    *
    * @param header: include column names
    * @param all: fetch all data from datasource
    * @returns A promise that resolves to a two-dimensional array representing the data.
    */
    getSourceData(header?: boolean, all?: boolean): Promise<any[][]>;
    /** As getSourceData but copies the data to the clipboard. Requires https */
    saveDataToClipBoard(header?: boolean, all?: boolean): Promise<void>;
    /** Gets the datasource associated with the model block.
    *
    * @returns The datasource associated with the model block.
    */
    get datasource(): DataSource;
    /** Sets the datasource for the model block.
    *
    * @param source - The new datasource to set.
    */
    set datasource(source: DataSource);
    /** Delete the current record
    *
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    delete(): Promise<boolean>;
    /** Insert a blank record
    *
    * @param before: Insert above the current row
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    insert(before?: boolean): Promise<boolean>;
    /** Gets the value of a field from the current record.
    *
    * @param field - The name of the field to retrieve the value from.
    * @returns The value of the specified field in the current record.
    */
    getValue(field: string): any;
    /**  Sets the value of a field in the current record.
    *
    * @param field - The name of the field to set the value for.
    * @param value - The new value to set for the field.
    */
    setValue(field: string, value: any): void;
    /** Is the block in a valid state
    *
    * @param field - The name of the field to check the validity for.
    * @returns A boolean indicating whether the block is in a valid state for the specified field.
    */
    isValid(field: string): boolean;
    /** Mark the field valid
    *
    * @param field - The name of the field to mark as valid or invalid.
    * @param flag - A boolean flag indicating whether to mark the field as valid or invalid.
    */
    setValid(field: string, flag: boolean): void;
    /** Gets the name of the current field in the view block.
    *
    * @returns The name of the current field.
    */
    getCurrentField(): string;
    /** Is block synchronized with backend
    *
    * @returns A boolean indicating whether the block has pending changes.
    */
    hasPendingChanges(): boolean;
    /** Show the last query for this block
    */
    showLastQuery(): void;
    /** setAndValidate field value as if changed by a user (fire all events)
    *
    * @param field - The name of the field to set and validate.
    * @param value - The new value to set for the field.
    * @returns A promise that resolves to a boolean indicating the success of the operation.
    */
    setAndValidate(field: string, value: any): Promise<boolean>;
    /** Lock current record
    *
    * @returns A promise that resolves when the record is successfully locked.
    */
    lock(): Promise<void>;
    /** Mark the current record as dirty
    *
    * @param field - Optional parameter specifying the field to mark as dirty.
    */
    setDirty(field?: string): void;
    /**  Gets the record associated with the specified offset.
    *
    * @param offset - The offset to retrieve the record from. Default is 0.
    * @returns The record associated with the specified offset.
    */
    getRecord(offset?: number): Record;
    /** Rehash the fields. Typically after dynamic insert/delete of HTML elements
    */
    reIndexFieldOrder(): void;
    /** Get properties used in Query By Example mode
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @returns The properties used in QBE mode for the specified field, or `null` if not found.
    */
    getQBEProperties(field: string): FieldProperties;
    /** Get properties used in insert mode
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @returns The properties used in insert mode for the specified field, or `null` if not found.
    */
    getInsertProperties(field: string): FieldProperties;
    /** Get properties used in display mode
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @returns The properties used in display mode for the specified field, or `null` if not found.
    */
    getDefaultProperties(field: string): FieldProperties;
    /** As in getQBEProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in QBE mode for the specified field ID, or `null` if not found.
    */
    getQBEPropertiesById(field: string, id: string): FieldProperties;
    /** As in getInsertProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in insert mode for the specified field ID, or `null` if not found.
    */
    getInsertPropertiesById(field: string, id: string): FieldProperties;
    /** As in getDefaultProperties, but narrow down on the field id
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @param id - The ID of the field to narrow down the search.
    * @returns The properties used in display mode for the specified field ID, or `null` if not found.
    */
    getDefaultPropertiesById(field: string, id: string): FieldProperties;
    /** As in getQBEProperties, but narrow down on a given class */
    getQBEPropertiesByClass(field: string, clazz?: string): FieldProperties;
    /** As in getInsertProperties, but narrow down a given class
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param clazz - The class to narrow down the search.
    * @returns The properties used in QBE mode for the specified class, or `null` if not found.
    */
    getInsertPropertiesByClass(field: string, clazz?: string): FieldProperties;
    /** As in getDefaultProperties, but narrow down a given class
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns The properties used in insert mode for the specified class, or `null` if not found.
    */
    getDefaultPropertiesByClass(field: string, clazz?: string): FieldProperties;
    /** Get properties for all fields in Query By Example mode
    *
    * @param field - The name of the field to retrieve QBE properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in QBE mode for all fields with the specified class.
    */
    getAllQBEPropertiesByClass(field: string, clazz?: string): FieldProperties[];
    /** Get properties for all fields in insert mode
    *
    * @param field - The name of the field to retrieve insert mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in insert mode for all fields with the specified class.
    */
    getAllInsertPropertiesByClass(field: string, clazz?: string): FieldProperties[];
    /** Get properties for all fields in display mode
    *
    * @param field - The name of the field to retrieve display mode properties for.
    * @param clazz - The class to narrow down the search.
    * @returns An array of properties used in display mode for all fields with the specified class.
    */
    getAllDefaultPropertiesByClass(field: string, clazz?: string): FieldProperties[];
    /** Apply Query By Example (QBE) properties to field
    *
    * @param props - The QBE properties to apply.
    * @param field - The name of the field to apply QBE properties to.
    * @param clazz - The class to narrow down the fields.
    */
    setQBEProperties(props: FieldProperties, field: string, clazz?: string): void;
    /** Apply insert properties to field
    *
    * @param props - The insert properties to apply.
    * @param field - The name of the field to apply insert properties to.
    * @param clazz -  narrow down on class
    */
    setInsertProperties(props: FieldProperties, field: string, clazz?: string): void;
    /** Apply display properties to field
    *
    * @param props - The display properties to apply.
    * @param field - The name of the field to apply display properties to.
    * @param clazz - narrow down on class
    */
    setDefaultProperties(props: FieldProperties, field: string, clazz?: string): void;
    /** Apply Query By Example properties to field param class - narrow down on id
    *
    * @param props - The QBE properties to apply.
    * @param field - The name of the field to apply QBE properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setQBEPropertiesById(props: FieldProperties, field: string, id: string): void;
    /** Apply insert properties to field param class - narrow down on id
    *
    * @param props - The insert properties to apply.
    * @param field - The name of the field to apply insert properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setInsertPropertiesById(props: FieldProperties, field: string, id: string): void;
    /** Apply display properties to field param clazz: narrow down on id
    *
    * @param props - The display properties to apply.
    * @param field - The name of the field to apply display properties to.
    * @param id - The ID of the field to narrow down the search.
    */
    setDefaultPropertiesById(props: FieldProperties, field: string, id: string): void;
    /** Re query the block with current filters
    *
    * This method triggers a requery operation on the block, refreshing the data based on the current filters.
   *
    * @returns A Promise that resolves to `true` if the requery is successful, otherwise `false`.
    */
    reQuery(): Promise<boolean>;
    /** Escape Query By Example mode
    *
    * This method cancels the Query By Example mode for the block, allowing the user to return to the regular mode.
    */
    cancelQueryMode(): void;
    /** Enter Query By Example mode
    *
    * This method activates the Query By Example mode for the block, allowing the user to perform queries based on example values.
    *
    * @returns A Promise that resolves to `true` if entering QBE mode is successful, otherwise `false`.
    */
    enterQueryMode(): Promise<boolean>;
    /** Executes a query on the block.
    *
    * This method initiates the execution of a query on the block, retrieving and displaying the results.
    *
    * @returns A Promise that resolves to `true` if the query execution is successful, otherwise `false`.
    */
    executeQuery(): Promise<boolean>;
    /** Remove event listener
    *
    * @param handle - the handle returned when applying the event listener
    */
    removeEventListener(handle: object): void;
    /** Apply event listener.
    *
    * @param method - The trigger function to be executed when the event occurs.
    * @param filter - A filter on the event (optional).
    * @returns An object representing the handle for the applied event listener.
    */
    addEventListener(method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
    /** Dump the fetched records to the console
    *
    */
    dump(): void;
}
