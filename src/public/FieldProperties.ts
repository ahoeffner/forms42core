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

import { Class } from './Class.js';
import { ListOfValues } from './ListOfValues.js';
import { MSGGRP } from '../messages/Internal.js';
import { Messages } from '../messages/Messages.js';
import { DataType } from '../view/fields/DataType.js';
import { DataMapper } from '../view/fields/DataMapper.js';
import { BasicProperties } from '../view/fields/BasicProperties.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';
import { Formatter, SimpleFormatter } from '../view/fields/interfaces/Formatter.js';

/**
 * HTML Properties used by bound fields
 */
export class FieldProperties extends BasicProperties
{
	constructor(properties:BasicProperties)
	{
		super();

		if (properties != null)
			FieldFeatureFactory.copyBasic(properties,this);
	}

	/** Clone the properties 
	* 
	* @returns A new instance of `FieldProperties` with cloned properties.
   * @public
   */
	public clone() : FieldProperties
	{
		return(new FieldProperties(this));
	}

	/** The tag ie. div, span, input etc 
	* 
   * @param {string} tag - The HTML tag to set.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
	public setTag(tag:string) : FieldProperties
	{
		this.tag = tag;
		return(this);
	}

	/** Underlying datatype. Inherited but cannot be changed 
	* 
	* @param {DataType} _type - The data type to set (ignored as the data type cannot be changed).
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
	public setType(_type:DataType) : FieldProperties
	{
		// Data type cannot be changed
		Messages.severe(MSGGRP.FIELD,1,this.tag);
		return(this);
	}

	/** Set enabled flag 
	* 
	* @param {boolean} flag - The flag to set for the enabled state.
   * @returns {FieldProperties} The current instance of `FieldProperties`.
   * @public
   */
	public setEnabled(flag:boolean) : FieldProperties
	{
		this.enabled = flag;
		return(this);
	}

	/** Set readonly flag 
	* 
	* @param flag - The flag to set for the read-only state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setReadOnly(flag:boolean) : FieldProperties
	{
		this.readonly = flag;
		return(this);
	}

	/** Determines if field is bound to datasource or not. Inherited but cannot be changed 
	* 
  	* @param flag - The flag to set for the derived state (ignored as it cannot be changed).
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setDerived(flag:boolean) : FieldProperties
	{
		this.derived = flag;
		return(this);
	}

	/** Set required flag 
	*
   * @param flag - The flag to set for the required state.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setRequired(flag:boolean) : FieldProperties
	{
		this.required = flag;
		return(this);
	}

	/** Set hidden flag 
	* 
	* @param flag - The flag to set for the hidden state.
	* @returns The current instance of `FieldProperties`.
	* @public
	*/
	public setHidden(flag:boolean) : FieldProperties
	{
		this.hidden = flag;
		return(this);
	}

	/** Set a style 
	* 
 	* @param style - The style to set.
   * @param value - The value to set for the style.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setStyle(style:string, value:string) : FieldProperties
	{
		super.setStyle(style,value);
		return(this);
	}

	/** Set all styles 
	* 
	* @param styles - The styles to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setStyles(styles:string) : FieldProperties
	{
		this.styles = styles;
		return(this);
	}

	/** Remove a style 
	* 
	* @param style - The style to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public removeStyle(style:string) : FieldProperties
	{
		super.removeStyle(style);
		return(this);
	}

	/** Set a class 
	*  
	* @param clazz - The class to set.
   * @returns The current instance of `FieldProperties`.
   * @public
   */
	public setClass(clazz:string) : FieldProperties
	{
		super.setClass(clazz);
		return(this);
	}

	/** Set all classes 
	*
   * @param classes - The classes to set, either as a string or an array of strings.
	* @returns The current instance of `FieldProperties`.
	* @public
	*/
	public setClasses(classes:string|string[]) : FieldProperties
	{
		super.setClasses(classes);
		return(this);
	}

	/** Remove a class
	* 
	* @param clazz - The class you want to remove.
   * @returns The current instance of `FieldProperties`.
   * @public
   */ 
	public removeClass(clazz:any) : FieldProperties
	{
		super.removeClass(clazz);
		return(this);
	}

	/** Set an attribute 
	* 
	* @param attr - The attribute to set.
 	* @param {any} [value] - The value for the attribute (optional).
 	* @returns The current instance of `FieldProperties`.
 	* @public
 	*/
	public setAttribute(attr:string, value?:any) : FieldProperties
	{
		super.setAttribute(attr,value);
		return(this);
	}

	/** Set all attributes 
	* 
	* @param attrs - The attributes as a map of attribute names to values.
 	* @returns The current instance of `FieldProperties`.
 	* @public
 	*/
	public setAttributes(attrs:Map<string,string>) : FieldProperties
	{
		super.setAttributes(attrs);
		return(this);
	}

	/** Remove an attribute 
	* 
	* @param attr - The attribute to remove.
 	* @returns The current instance of `FieldProperties`.
 	* @public
 	*/
	public removeAttribute(attr:string) : FieldProperties
	{
		super.removeAttribute(attr);
		return(this);
	}

	/** Set the value attribute 
	* 
	* @param {string} value - The value to set.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setValue(value:string) : FieldProperties
	{
		this.value = value;
		return(this);
	}

	/** Set a list of valid values 
	* 
	* @param {string[] | Set<any> | Map<any, any>} values - The valid values as an array, set, or map.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setValidValues(values: string[] | Set<any> | Map<any,any>) : FieldProperties
	{
		this.validValues = values;
		return(this);
	}

	/** Set a two-way data mapper 
	* 
	* @param {Class<DataMapper> | DataMapper | string} mapper - The data mapper class, instance, or string representation.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setMapper(mapper:Class<DataMapper>|DataMapper|string) : FieldProperties
	{
		super.setMapper(mapper);
		return(this);
	}

	/** Set formatter 
	* 
	* @param {Class<Formatter> | Formatter | string} formatter - The formatter class, instance, or string representation.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setFormatter(formatter:Class<Formatter>|Formatter|string) : FieldProperties
	{
		super.setFormatter(formatter);
		return(this);
	}

	/** Set simple formatter 
	* 
	* @param {Class<SimpleFormatter> | SimpleFormatter | string} formatter - The simple formatter class, instance, or string representation.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setSimpleFormatter(formatter:Class<SimpleFormatter>|SimpleFormatter|string) : FieldProperties
	{
		super.setSimpleFormatter(formatter);
		return(this);
	}

	/** Set listofvalues 
	* 
	* @param {Class<ListOfValues> | ListOfValues | string} listofvalues - The list of values class, instance, or string representation.
 	* @returns {FieldProperties} The current instance of `FieldProperties`.
 	* @public
 	*/
	public setListOfValues(listofvalues:Class<ListOfValues>|ListOfValues|string) : FieldProperties
	{
		super.setListOfValues(listofvalues);
		return(this);
	}
}