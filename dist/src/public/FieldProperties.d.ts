import { Class } from './Class.js';
import { ListOfValues } from './ListOfValues.js';
import { DataType } from '../view/fields/DataType.js';
import { DataMapper } from '../view/fields/DataMapper.js';
import { BasicProperties } from '../view/fields/BasicProperties.js';
import { Formatter, SimpleFormatter } from '../view/fields/interfaces/Formatter.js';
/**
 * HTML Properties used by bound fields
 */
export declare class FieldProperties extends BasicProperties {
    constructor(properties: BasicProperties);
    /** Clone the properties
    *
    * @returns A new instance of `FieldProperties` with cloned properties.
   * @public
   */
    clone(): FieldProperties;
    /** The tag ie. div, span, input etc
    *
   * @param {string} tag - The HTML tag to set.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setTag(tag: string): FieldProperties;
    /** Underlying datatype. Inherited but cannot be changed
    *
    * @param {DataType} _type - The data type to set (ignored as the data type cannot be changed).
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setType(_type: DataType): FieldProperties;
    /** Set enabled flag
    *
    * @param {boolean} flag - The flag to set for the enabled state.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setEnabled(flag: boolean): FieldProperties;
    /** Set readonly flag
    *
    * @param flag - The flag to set for the read-only state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setReadOnly(flag: boolean): FieldProperties;
    /** Determines if field is bound to datasource or not. Inherited but cannot be changed
    *
    * @param flag - The flag to set for the derived state (ignored as it cannot be changed).
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setDerived(flag: boolean): FieldProperties;
    /** Set required flag
    *
   * @param flag - The flag to set for the required state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setRequired(flag: boolean): FieldProperties;
    /** Set hidden flag
    *
    * @param flag - The flag to set for the hidden state.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setHidden(flag: boolean): FieldProperties;
    /** Set a style
    *
    * @param style - The style to set.
   * @param value - The value to set for the style.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setStyle(style: string, value: string): FieldProperties;
    /** Set all styles
    *
    * @param styles - The styles to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setStyles(styles: string): FieldProperties;
    /** Remove a style
    *
    * @param style - The style to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    removeStyle(style: string): FieldProperties;
    /** Set a class
    *
    * @param clazz - The class to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setClass(clazz: string): FieldProperties;
    /** Set all classes
    *
   * @param classes - The classes to set, either as a string or an array of strings.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setClasses(classes: string | string[]): FieldProperties;
    /** Remove a class
    *
    * @param clazz - The class you want to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    removeClass(clazz: any): FieldProperties;
    /** Set an attribute
    *
    * @param attr - The attribute to set.
    * @param {any} [value] - The value for the attribute (optional).
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setAttribute(attr: string, value?: any): FieldProperties;
    /** Set all attributes
    *
    * @param attrs - The attributes as a map of attribute names to values.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setAttributes(attrs: Map<string, string>): FieldProperties;
    /** Remove an attribute
    *
    * @param attr - The attribute to remove.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    removeAttribute(attr: string): FieldProperties;
    /** Set the value attribute
    *
    * @param {string} value - The value to set.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setValue(value: string): FieldProperties;
    /** Set a list of valid values
    *
    * @param {string[] | Set<any> | Map<any, any>} values - The valid values as an array, set, or map.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setValidValues(values: string[] | Set<any> | Map<any, any>): FieldProperties;
    /** Set a two-way data mapper
    *
    * @param {Class<DataMapper> | DataMapper | string} mapper - The data mapper class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setMapper(mapper: Class<DataMapper> | DataMapper | string): FieldProperties;
    /** Set formatter
    *
    * @param {Class<Formatter> | Formatter | string} formatter - The formatter class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setFormatter(formatter: Class<Formatter> | Formatter | string): FieldProperties;
    /** Set simple formatter
    *
    * @param {Class<SimpleFormatter> | SimpleFormatter | string} formatter - The simple formatter class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setSimpleFormatter(formatter: Class<SimpleFormatter> | SimpleFormatter | string): FieldProperties;
    /** Set listofvalues
    *
    * @param {Class<ListOfValues> | ListOfValues | string} listofvalues - The list of values class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setListOfValues(listofvalues: Class<ListOfValues> | ListOfValues | string): FieldProperties;
}
