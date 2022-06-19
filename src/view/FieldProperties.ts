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

	public clear() : void
	{
		this.overrides$.clear();
	}

	public setDefault(inst:FieldInstance, properties:HTMLProperties) : void
	{
		this.defaults$.set(inst,properties);
	}

	public static consume(tag:HTMLElement) : HTMLProperties
	{
		let props:HTMLProperties = new HTMLProperties();
		let skip:string[] = ["id","name","block","row","value"];

		props.tag = tag.tagName;
		props.id = tag.getAttribute("id");

		props.block = tag.getAttribute("block");
		if (props.block == null) throw "@FieldInstance: Block must be specified";

		props.name = tag.getAttribute("name");
		if (props.name == null)	throw "@FieldInstance: Name must be specified";

		props.value = tag.getAttribute("value");
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
			props.setValidValues(FieldProperties.getSelectOptions(tag));
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

			if (props.getAttribute("type")?.toLowerCase() == "checkbox")
				tag.setAttribute("value",props.value);

			if (props.getAttribute("type")?.toLowerCase() == "radio")
				tag.setAttribute("value",props.value);
		}

		else

		if (tag instanceof HTMLSelectElement)
		{
			tag.hidden = props.hidden;
			tag.disabled = !props.enabled;
			tag.required = props.required;
			FieldProperties.setSelectOptions(tag,props);
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
			if (flag)
			{
				let idx:number = tag.options.selectedIndex;
				if (idx < 0) idx = 0;

				let option:HTMLOptionElement = tag.options.item(idx);

				while(tag.options.length > 0)
					tag.options.remove(0);

				tag.options.add(option);
			}
			else
			{
				this.setSelectOptions(tag,props);
			}
		}
	}

	public static setEnabled(tag:HTMLElement, _props:HTMLProperties, flag:boolean) : void
	{
		if (tag instanceof HTMLInputElement) tag.disabled = !flag;
		if (tag instanceof HTMLSelectElement) tag.disabled = !flag;
	}

	private static getSelectOptions(tag:HTMLSelectElement) : Map<string,string>
	{
		let options:Map<string,string> = new Map<string,string>();

		options.set("","");
		for (let i = 0; i < tag.options.length; i++)
		{
			let label:string = tag.options.item(i).label.trim();
			let value:string = tag.options.item(i).value.trim();

			if (label.length > 0 || value.length > 0)
			{

				if (label.length == 0 && value.length != null)
				label = value;

				options.set(label,value);
			}
		}

		return(options);
	}

	private static setSelectOptions(tag:HTMLSelectElement, props:HTMLProperties) : void
	{
		while(tag.options.length > 0)
			tag.options.remove(0);

		let options:HTMLOptionElement[] = [];

		if (props.getValidValues() instanceof Set)
		{
			props.getValidValues().forEach((value:string) =>
			{
				let option:HTMLOptionElement = new HTMLOptionElement();

				option.label = value;
				option.value = value;

				options.push(option);
			})
		}

		if (props.getValidValues() instanceof Map)
		{
			props.getValidValues().forEach((value:string,label:string) =>
			{
				let option:HTMLOptionElement = new Option();

				option.label = label;
				option.value = value;

				options.push(option);
			})
		}

		options.forEach((option) => tag.options.add(option));
	}
}