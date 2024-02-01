import { Block } from '../public/Block.js';
import { Key } from '../model/relations/Key.js';
import { Class } from '../public/Class.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { ListOfValues } from '../public/ListOfValues.js';
import { Level } from '../messages/Messages.js';
import { DateConstraint } from '../public/DateConstraint.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { TriggerFunction } from '../public/TriggerFunction.js';
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
    constructor(page?: string | HTMLElement);
    get name(): string;
    /** The canvas points to the html associated with the form */
    get canvas(): Canvas;
    /** Get all blocks on the form */
    get blocks(): Block[];
    /** Remove the form from it's parent element */
    hide(): void;
    /** Attach the form to it's previous parent */
    show(): void;
    /** Remove the form from it's parent element (same as hide) */
    dettach(): void;
    /** Attach the form to this element */
    attach(parent: HTMLElement): void;
    /** Clears the form. If force, no validation will take place and changes will be ignored */
    clear(force?: boolean): Promise<boolean>;
    focus(): void;
    getCurrentBlock(): Block;
    /** Requires the block using the current filter. Often used with sorting */
    reQuery(block: string): Promise<boolean>;
    /** Enter the Query By Example mode for the specified block (and children)*/
    enterQueryMode(block: string): Promise<boolean>;
    /** Execute query for the specified block (and children) */
    executeQuery(block: string): Promise<boolean>;
    /** Show the datepicker popup */
    showDatePicker(block: string, field: string, row?: number): void;
    /** Show the LOV associated with the block, field. Normally only 1 LOV can be active, force overrules this rule */
    showListOfValues(block: string, field: string, row?: number): void;
    /** Simulate keystroke from a field. The field is located from the block, field an optionally css-class*/
    sendkey(key: KeyMap, block?: string, field?: string, clazz?: string): Promise<boolean>;
    /** Link 2 blocks (master detail) on specified keys. If not orphan, the child block will not be part of QBE */
    link(master: Key, detail: Key, orphanQueries?: boolean): void;
    goBlock(block: string): Promise<boolean>;
    goField(block: string, field: string, clazz?: string): Promise<boolean>;
    /** Handle fine message */
    fine(grpno: number, errno: number, ...args: any): void;
    /** Handle info message */
    info(grpno: number, errno: number, ...args: any): void;
    /** Handle warning message */
    warn(grpno: number, errno: number, ...args: any): void;
    /** Handle severe message */
    severe(grpno: number, errno: number, ...args: any): void;
    /** Popup a message */
    alert(msg: string, title: string, level?: Level): void;
    /** Has the form been validated, and is everthing consistent */
    get valid(): boolean;
    /** Validates all user input */
    validate(): Promise<boolean>;
    /** Returns the canvas html-element */
    getView(): HTMLElement;
    /** Returns the canvas view (x,y,h,w) */
    getViewPort(): View;
    /** Sets the canvas view (x,y,h,w) */
    setViewPort(view: View): void;
    /** Returns the canvas parent view (x,y,h,w) */
    getParentViewPort(): View;
    getBlock(block: string): Block;
    /** Set the datasource for the given block */
    setDataSource(block: string, source: DataSource): void;
    /** Get the LOV for the given block and field */
    getListOfValues(block: string, field: string): ListOfValues;
    /** Remove the LOV for the given block and field */
    removeListOfValues(block: string, field: string | string[]): void;
    /** Set the LOV for the given block, field or fields */
    setListOfValues(lov: ListOfValues | Class<ListOfValues>, block: string, field: string | string[]): void;
    /** Set the date constraint ie exclude weekends and holidays from the datepicker */
    setDateConstraint(datecstr: DateConstraint, block: string, field: string | string[]): void;
    /** Set valid values for a given field */
    setValidValues(block: string, field: string | string[], values: string[] | Set<any> | Map<any, any>): void;
    /** Get the value of a given block, field */
    getValue(block: string, field: string): any;
    /** Set the value of a given block, field */
    setValue(block: string, field: string, value: any): void;
    /** Flush all changes to the backend */
    flush(): Promise<boolean>;
    /** Call another form in non modal mode */
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
