import { FieldProperties } from "./FieldProperties.js";
import { Record as Internal, RecordState } from "../model/Record.js";
/**
 * Public interface to a Record.
 *
 * A Record is a collection of name,value pairs
 *	and represents data from a backend.
 *
 */
export declare class Record {
    private rec$;
    constructor(rec: Internal);
    /** The record number */
    get recno(): number;
    /** State of record */
    get state(): RecordState;
    /** Is record in an inserted state */
    get inserted(): boolean;
    /** Is record in an updated state */
    get updated(): boolean;
    /** Is record in an deleted state */
    get deleted(): boolean;
    /** Has the record been synchronized with the backend */
    get synchronized(): boolean;
    /** Get the response from the last operation on the backend */
    get response(): any;
    /** Get the value of a given field */
    getValue(field: string): any;
    /** Execute datasource default lock method */
    lock(): Promise<boolean>;
    /** Mark the record as locked */
    markAsLocked(flag?: boolean): void;
    /**
     * Make sure the datasource marks this record updated.
     * @param field any non derived field
     */
    setDirty(field?: string): void;
    /**
     * setAndValidate field value as if changed by a user.
     * @param field
     */
    setAndValidate(field: string, value: any): Promise<boolean>;
    /**
     * Set the field value. This operation neither locks the record, nor marks it dirty
     * @param field
     * @param value
     */
    setValue(field: string, value: any): void;
    /**
      * Change the tag input, span, div ... for the given field
      * @param field
      * @param tag
      */
    setTag(field: string, tag: string): void;
    /** Set readonly state for a given field */
    setReadOnly(field: string, flag: boolean): void;
    /** Set required state for a given field */
    setRequired(field: string, flag: boolean): void;
    /** Set enabled state for a given field */
    setEnabled(field: string, flag: boolean): void;
    /** Set disabled state for a given field */
    setDisabled(field: string, flag: boolean): void;
    /** Get the style for a given field and type */
    getStyle(field: string, style: string): string;
    /** Set a style for a given field */
    setStyle(field: string, style: string, value: any): void;
    /** Remove a style for a given field */
    removeStyle(field: string, style: string): void;
    /** Check if a given field has class */
    hasClass(field: string, clazz: string): boolean;
    /** Set a class on a given field */
    setClass(field: string, clazz: string): void;
    /** Remove a class on a given field */
    removeClass(field: string, clazz: string): void;
    /** Check if a given field has attribute */
    hasAttribute(field: string, attr: string): boolean;
    /** Get the value of a given field and attribute */
    getAttribute(field: string, attr: string): string;
    /** Set an attribute on a given field */
    setAttribute(field: string, attr: string, value?: any): void;
    /** Remove an attribute on a given field */
    removeAttribute(field: string, attr: string): void;
    /** Get a copy of all properties for a given field */
    getProperties(field: string, clazz?: string): FieldProperties;
    /** Apply properties on a given field. Properties will be cloned */
    setProperties(props: FieldProperties, field: string, clazz?: string): void;
    /** Clear all custom properties for the given record, field and class */
    clearProperties(field?: string, clazz?: string): void;
    toString(): string;
}
