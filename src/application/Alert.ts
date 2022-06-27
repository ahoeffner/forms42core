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

export enum Type
{
	Log,
	Popup,
	PopAndLog
}

export class Alert
{
	public static fatal(msg:string, title:string, type?:Type)
	{
		if (type == null)
			type = Type.PopAndLog;

		//window.alert(msg);
		console.log(msg);
	}
	public static warning(msg:string, title:string, type?:Type)
	{
		if (type == null)
			type = Type.Popup;

		//window.alert(msg);
		console.log(msg);
	}

	public static message(msg:string, title:string, type?:Type)
	{
		if (type == null)
			type = Type.Popup;

		//window.alert(msg);
		console.log(msg);
	}
}