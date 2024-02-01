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
import { MSGGRP } from '../messages/Internal.js';
import { Messages } from '../messages/Messages.js';
import { BasicProperties } from '../view/fields/BasicProperties.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';
/**
 * HTML Properties used by bound fields
 */
export class FieldProperties extends BasicProperties {
    constructor(properties) {
        super();
        if (properties != null)
            FieldFeatureFactory.copyBasic(properties, this);
    }
    /** Clone the properties
    *
    * @returns A new instance of `FieldProperties` with cloned properties.
   * @public
   */
    clone() {
        return (new FieldProperties(this));
    }
    /** The tag ie. div, span, input etc
    *
   * @param {string} tag - The HTML tag to set.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setTag(tag) {
        this.tag = tag;
        return (this);
    }
    /** Underlying datatype. Inherited but cannot be changed
    *
    * @param {DataType} _type - The data type to set (ignored as the data type cannot be changed).
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setType(_type) {
        // Data type cannot be changed
        Messages.severe(MSGGRP.FIELD, 1, this.tag);
        return (this);
    }
    /** Set enabled flag
    *
    * @param {boolean} flag - The flag to set for the enabled state.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
    setEnabled(flag) {
        this.enabled = flag;
        return (this);
    }
    /** Set readonly flag
    *
    * @param flag - The flag to set for the read-only state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setReadOnly(flag) {
        this.readonly = flag;
        return (this);
    }
    /** Determines if field is bound to datasource or not. Inherited but cannot be changed
    *
    * @param flag - The flag to set for the derived state (ignored as it cannot be changed).
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setDerived(flag) {
        this.derived = flag;
        return (this);
    }
    /** Set required flag
    *
   * @param flag - The flag to set for the required state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setRequired(flag) {
        this.required = flag;
        return (this);
    }
    /** Set hidden flag
    *
    * @param flag - The flag to set for the hidden state.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setHidden(flag) {
        this.hidden = flag;
        return (this);
    }
    /** Set a style
    *
    * @param style - The style to set.
   * @param value - The value to set for the style.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setStyle(style, value) {
        super.setStyle(style, value);
        return (this);
    }
    /** Set all styles
    *
    * @param styles - The styles to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setStyles(styles) {
        this.styles = styles;
        return (this);
    }
    /** Remove a style
    *
    * @param style - The style to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    removeStyle(style) {
        super.removeStyle(style);
        return (this);
    }
    /** Set a class
    *
    * @param clazz - The class to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    setClass(clazz) {
        super.setClass(clazz);
        return (this);
    }
    /** Set all classes
    *
   * @param classes - The classes to set, either as a string or an array of strings.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setClasses(classes) {
        super.setClasses(classes);
        return (this);
    }
    /** Remove a class
    *
    * @param clazz - The class you want to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
    removeClass(clazz) {
        super.removeClass(clazz);
        return (this);
    }
    /** Set an attribute
    *
    * @param attr - The attribute to set.
    * @param {any} [value] - The value for the attribute (optional).
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setAttribute(attr, value) {
        super.setAttribute(attr, value);
        return (this);
    }
    /** Set all attributes
    *
    * @param attrs - The attributes as a map of attribute names to values.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    setAttributes(attrs) {
        super.setAttributes(attrs);
        return (this);
    }
    /** Remove an attribute
    *
    * @param attr - The attribute to remove.
    * @returns The current instance of `FieldProperties`.
    * @public
    */
    removeAttribute(attr) {
        super.removeAttribute(attr);
        return (this);
    }
    /** Set the value attribute
    *
    * @param {string} value - The value to set.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setValue(value) {
        this.value = value;
        return (this);
    }
    /** Set a list of valid values
    *
    * @param {string[] | Set<any> | Map<any, any>} values - The valid values as an array, set, or map.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setValidValues(values) {
        this.validValues = values;
        return (this);
    }
    /** Set a two-way data mapper
    *
    * @param {Class<DataMapper> | DataMapper | string} mapper - The data mapper class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setMapper(mapper) {
        super.setMapper(mapper);
        return (this);
    }
    /** Set formatter
    *
    * @param {Class<Formatter> | Formatter | string} formatter - The formatter class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setFormatter(formatter) {
        super.setFormatter(formatter);
        return (this);
    }
    /** Set simple formatter
    *
    * @param {Class<SimpleFormatter> | SimpleFormatter | string} formatter - The simple formatter class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setSimpleFormatter(formatter) {
        super.setSimpleFormatter(formatter);
        return (this);
    }
    /** Set listofvalues
    *
    * @param {Class<ListOfValues> | ListOfValues | string} listofvalues - The list of values class, instance, or string representation.
    * @returns {FieldProperties} The current instance of `FieldProperties`.
    * @public
    */
    setListOfValues(listofvalues) {
        super.setListOfValues(listofvalues);
        return (this);
    }
}
