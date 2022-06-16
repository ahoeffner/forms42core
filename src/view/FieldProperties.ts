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

import { FieldInstance } from "./fields/FieldInstance.js";
import { HTMLProperties } from "./fields/HTMLProperties.js";


export class FieldProperties
{
	private defaults$:Map<FieldInstance,HTMLProperties> =
		new Map<FieldInstance,HTMLProperties>();

	private overrides$:Map<object,Map<FieldInstance,HTMLProperties>> =
		new Map<object,Map<FieldInstance,HTMLProperties>>();

	public static consume(tag:HTMLElement) : HTMLProperties
	{
		let skip:string[] = ["id","name","block","row"];
		let props:HTMLProperties = new HTMLProperties();

		props.tag = tag.tagName;
		props.id = tag.getAttribute("id");
		props.subtype = tag.getAttribute("type");

		props.block = tag.getAttribute("block");
		if (props.block == null) throw "@FieldInstance: Block must be specified";

		props.name = tag.getAttribute("name");
		if (props.name == null)	throw "@FieldInstance: Name must be specified";

		let row:string = tag.getAttribute("row");

		if (row == null) row = "-1";
		else if (isNaN(+row)) throw "@FieldInstance: row: '"+row+"' is not a number";

		props.row = +row;

		if (tag instanceof HTMLInputElement)
		{
			props.hidden = tag.hidden;
			props.enabled = !tag.disabled;
			props.readonly = tag.readOnly;
			props.required = tag.required;
		}

		else

		if (tag instanceof HTMLSelectElement)
		{
			props.readonly = false;
			props.hidden = tag.hidden;
			props.enabled = !tag.disabled;
			props.required = tag.required;
		}

		for (let cls of tag.classList.values())
			props.setClass(cls);

		let an:string[] = tag.getAttributeNames();

		an.forEach((name) =>
		{
			if (!skip.includes(name.toLowerCase()))
				props.setAttribute(name,tag.getAttribute(name));
		});

		return(props);
	}

	public static apply(tag:HTMLElement, props:HTMLProperties) : void
	{
		let styles:string = "";

		tag.setAttribute("name",props.name);
		tag.setAttribute("block",props.block);
		if (props.id != null) tag.setAttribute("id",props.id);
		if (props.row >= 0) tag.setAttribute("row",""+props.row);

		props.getClasses().forEach((clazz) => {tag.classList.add(clazz)});
		props.getStyles().forEach((style,name) => {styles += name+":"+style+";"});
		props.getAttributes().forEach((value,name) => {tag.setAttribute(name,value)});

		tag.style.cssText = styles;

		if (tag instanceof HTMLInputElement)
		{
			tag.hidden = props.hidden;
			tag.disabled = !props.enabled;
			tag.readOnly = props.readonly;
			tag.required = props.required;
		}

		else

		if (tag instanceof HTMLSelectElement)
		{
			tag.hidden = props.hidden;
			tag.disabled = !props.enabled;
			tag.required = props.required;
			FieldProperties.setReadOnly(tag,props,props.readonly);
		}
	}

	public static setReadOnlyState(tag:HTMLElement, props:HTMLProperties, flag:boolean) : void
	{
		if (flag) FieldProperties.setReadOnly(tag,props,flag);
		else if (!props.readonly) FieldProperties.setReadOnly(tag,props,flag);
	}

	public static setEnabledState(tag:HTMLElement, props:HTMLProperties, flag:boolean) : void
	{
		if (!flag) FieldProperties.setEnabled(tag,props,flag);
		else if (props.enabled) FieldProperties.setEnabled(tag,props,flag);
	}

	public static setReadOnly(tag:HTMLElement, props:HTMLProperties, flag:boolean) : void
	{
		if (tag instanceof HTMLInputElement) tag.readOnly = flag;

		if (tag instanceof HTMLSelectElement)
		{
			let idx:number = tag.options.selectedIndex;
		}
	}

	public static setEnabled(tag:HTMLElement, _props:HTMLProperties, flag:boolean) : void
	{
		if (tag instanceof HTMLInputElement) tag.disabled = !flag;
		if (tag instanceof HTMLSelectElement) tag.disabled = !flag;
	}
}