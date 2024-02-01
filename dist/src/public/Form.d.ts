import { Block } from './Block.js';
import { Class } from './Class.js';
import { Key } from '../model/relations/Key.js';
import { ListOfValues } from './ListOfValues.js';
import { DateConstraint } from './DateConstraint.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { TriggerFunction } from './TriggerFunction.js';
import { Level } from '../messages/Messages.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { Canvas, View } from '../application/interfaces/Canvas.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
/**
 * The form object links html and business logic.
 *
 * A form consists of blocks that links to backend data.
 * The form can hold all necessary code, LOV's etc. But in general
 * generic code for blocks should be put at the block level to ensure reuse.
 *
 */
export declare class Form implements CanvasComponent {
    title: string;
    moveable: boolean;
    resizable: boolean;
    initiated: Date;
    parameters: Map<any, any>;
    /**
   * Constructs a new Form instance.
   *
   * @param page - The HTML page or element associated with the form.
   */
    constructor(page?: string | HTMLElement);
    /**
   * Gets the lowercase name of the form's constructor.
   *
   * @returns The name of the form.
   */
    get name(): string;
    /** The canvas points to the html associated with the form
    *
   * @returns The canvas element.
   */
    get canvas(): Canvas;
    /** Get all blocks on the form
    *
   * @returns An array of Block instances.
   */
    get blocks(): Block[];
    /** Remove the form from it's parent element
    *
    */
    hide(): void;
    /** Attach the form to it's previous parent
    *
    */
    show(): void;
    /** Remove the form from it's parent element (same as hide)
    *
    */
    dettach(): void;
    /** Attach the form to this element
    *
    * @param parent - The parent element to attach the form to.
   */
    attach(parent: HTMLElement): void;
    /** Clears the form. If force, no validation will take place and changes will be ignored
    *
    * @param force - If true, no validation will occur.
   * @returns A promise indicating whether the clearing was successful.
   */
    clear(force?: boolean): Promise<boolean>;
    /** Focuses on the form.
   *
   */
    focus(): void;
    /** Gets the current block.
   *
   * @returns The current block.
   */
    getCurrentBlock(): Block;
    /** Requires the block using the current filter. Often used with sorting
    *
    * @param block - The block to requery.
   * @returns A promise indicating whether the requery was successful.
   */
    reQuery(block: string): Promise<boolean>;
    /** Enter the Query By Example mode for the specified block (and children)
    *
    * @param block - The block for which to enter Query By Example mode.
   * @returns A promise indicating whether entering Query By Example mode was successful.
   */
    enterQueryMode(block: string): Promise<boolean>;
    /** Execute query for the specified block (and children)
    *
    * @param block - The block for which to execute the query.
   * @returns A promise indicating whether the query execution was successful.
   */
    executeQuery(block: string): Promise<boolean>;
    /** Show the datepicker popup
    *
    * @param block - The block associated with the datepicker.
   * @param field - The field associated with the datepicker.
   * @param row - The row number (optional).
   */
    showDatePicker(block: string, field: string, row?: number): void;
    /** Show the LOV associated with the block, field. Normally only 1 LOV can be active, force overrules this rule
    *
    * @param block - The block associated with the List of Values.
   * @param field - The field associated with the List of Values.
   * @param row - The row number (optional).
   */
    showListOfValues(block: string, field: string, row?: number): void;
    /** Simulate keystroke from a field. The field is located from the block, field an optionally css-class
    *
    * @param key - The keystroke to simulate.
   * @param block - The block containing the field (optional).
   * @param field - The field to simulate the keystroke on (optional).
   * @param clazz - The CSS class (optional).
   * @returns A promise indicating whether the keystroke simulation was successful.
   */
    sendkey(key: KeyMap, block?: string, field?: string, clazz?: string): Promise<boolean>;
    /** Link 2 blocks (master detail) on specified keys. If not orphan, the child block will not be part of QBE
    *
    * @param master - The key for the master block.
   * @param detail - The key for the detail block.
   * @param orphanQueries - If true, orphan queries will be set (optional).
   */
    link(master: Key, detail: Key, orphanQueries?: boolean): void;
    /**  Navigates to the specified block.
   *
   * @param block - The block to navigate to.
   * @returns A promise indicating whether the navigation was successful.
   */
    goBlock(block: string): Promise<boolean>;
    /** Navigates to the specified field in the specified block.
   *
   * @param block - The block containing the field.
   * @param field - The field to navigate to.
   * @param clazz - The CSS class (optional).
   * @returns A promise indicating whether the navigation was successful.
   */
    goField(block: string, field: string, clazz?: string): Promise<boolean>;
    /** Handle fine message
    *
    * @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
    fine(grpno: number, errno: number, ...args: any): void;
    /** Handle info message
    *
    * @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
    info(grpno: number, errno: number, ...args: any): void;
    /** Handle warning message
    *
    * @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
    warn(grpno: number, errno: number, ...args: any): void;
    /** Handle severe message
    *
    * @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
    severe(grpno: number, errno: number, ...args: any): void;
    /** Popup a message
    *
    * @param msg - The message to display.
   * @param title - The title of the popup.
   * @param level - The level of the message (optional).
   */
    alert(msg: string, title: string, level?: Level): void;
    /** Has the form been validated, and is everthing consistent
    *
    * @returns True if the form is valid, otherwise false.
   */
    get valid(): boolean;
    /** Validates all user input
    *
    * @returns A promise indicating whether the validation was successful.
   */
    validate(): Promise<boolean>;
    /** Returns the canvas html-element
    *
    * @returns The HTML element representing the view.
   */
    getView(): HTMLElement;
    /** Returns the canvas view (x,y,h,w)
    *
    * @returns The canvas view as a View object.
   */
    getViewPort(): View;
    /** Sets the canvas view (x,y,h,w)
    *
    * @param view - The View object representing the new canvas view.
   */
    setViewPort(view: View): void;
    /** Returns the canvas parent view (x,y,h,w)
    *
    * @returns The parent view as a View object.
   */
    getParentViewPort(): View;
    /**  Gets the block associated with the specified name.
   *
   * @param block - The name of the block.
   * @returns The Block object associated with the specified name.
   */
    getBlock(block: string): Block;
    /** Set the datasource for the given block
    *
    * @param block - The block for which to set the data source.
   * @param source - The data source to set.
   */
    setDataSource(block: string, source: DataSource): void;
    /** Get the LOV for the given block and field
    *
    * @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV.
   * @returns The List of Values (LOV) for the given block and field.
   */
    getListOfValues(block: string, field: string): ListOfValues;
    /** Remove the LOV for the given block and field
    *
    * @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV, or an array of fields.
   */
    removeListOfValues(block: string, field: string | string[]): void;
    /** Set the LOV for the given block, field or fields
    *
    * @param lov - The List of Values (LOV) or its class.
   * @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV, or an array of fields.
   */
    setListOfValues(lov: ListOfValues | Class<ListOfValues>, block: string, field: string | string[]): void;
    /** Set the date constraint ie exclude weekends and holidays from the datepicker
    *
    * @param datecstr - The date constraint to set.
   * @param block - The block associated with the date constraint.
   * @param field - The field associated with the date constraint, or an array of fields.
   */
    setDateConstraint(datecstr: DateConstraint, block: string, field: string | string[]): void;
    /** Set valid values for a given field */
    setValidValues(block: string, field: string | string[], values: string[] | Set<any> | Map<any, any>): void;
    /** Get the value of a given block, field
    *
    * @param block - The block containing the field.
   * @param field - The field for which to get the value.
   * @returns The value of the specified field in the specified block.
   */
    getValue(block: string, field: string): any;
    /** Set the value of a given block, field
    *
    * @param block - The block containing the field.
   * @param field - The field for which to set the value.
   * @param value - The value to set.
   */
    setValue(block: string, field: string, value: any): void;
    /** Flush all changes to the backend
    *
    * @returns A promise indicating whether the flushing was successful.
   */
    flush(): Promise<boolean>;
    /** Call another form in non modal mode
    *
    * @param form - The form class or name to call.
   * @param parameters - The parameters to pass to the form (optional).
   * @param container - The container to append the form to (optional).
   * @returns A promise containing the Form instance of the called form.
   */
    showform(form: Class<Form> | string, parameters?: Map<any, any>, container?: HTMLElement): Promise<Form>;
    /** Call another form in modal mode */
    callform(form: Class<Form> | string, parameters?: Map<any, any>, container?: HTMLElement): Promise<Form>;
    /** After changes to the HTML, reindexing is necessary */
    reIndexFieldOrder(): void;
    /** 'Labels' that points to fields can be repositioned by the user */
    startFieldDragging(): void;
    /** Replace the HTML. Change everything, delete all blocks and create new etc */
    setView(page: string | HTMLElement): Promise<void>;
    /** Close the form. If force no validation will take place */
    close(force?: boolean): Promise<boolean>;
    /** Remove an eventlistener. This should also be done before setView is called */
    removeEventListener(handle: object): void;
    /** Add an eventlistener */
    addEventListener(method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
}
