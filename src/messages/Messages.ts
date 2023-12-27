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

import { InternalUS } from "./InternalUS.js";
import { Group } from "./interfaces/Group.js";
import { Bundle } from "./interfaces/Bundle.js";
import { Alert } from "../application/Alert.js";
import { Message } from "./interfaces/Message.js";

export class Messages
{
	private static files$:Bundle[] = [];
	private static language$:string = null;

	private static groups$:Map<number,Group> =
		new Map<number,Group>();

	private static messages$:Map<number,Map<number,Message>> =
		new Map<number,Map<number,Message>>();

	/** all messages language */
	public static set language(language:string)
	{
		if (!Messages.language$)
		{
			// Add internal bundles
			Messages.addBundle(new InternalUS());
		}

		Messages.language$ = language.toUpperCase();

		this.files$.forEach((bundle) =>
		{
			if (bundle.lang == Messages.language)
				Messages.load(bundle);
		})
	}

	/** all messages language */
	public static get language() : string
	{
		return(Messages.language$);
	}

	/** Add message bundle */
	public static addBundle(bundle:Bundle) : void
	{
		if (!Messages.files$.includes(bundle))
			Messages.files$.push(bundle);

		bundle.lang = bundle.lang.toUpperCase();
		if (bundle.lang == Messages.language) Messages.load(bundle);
	}

	public static get(grpno:number,errno:number) : Message
	{
		let msg:Message = null;
		let group:Map<number,Message> = Messages.messages$.get(grpno);
		if (group) msg = group.get(errno);
		return(msg);
	}

	public static getGroup(grpno:number) : Group
	{
		return(Messages.groups$.get(grpno));
	}

	public static getBundles() : Bundle[]
	{
		return(Messages.files$);
	}

	public static async fine(grpno:number,errno:number,...args:any) : Promise<void>
	{
		await Messages.show(grpno,errno,Level.fine,args);
	}

	public static async info(grpno:number,errno:number,...args:any) : Promise<void>
	{
		await Messages.show(grpno,errno,Level.info,args);
	}

	public static async warn(grpno:number,errno:number,...args:any) : Promise<void>
	{
		await Messages.show(grpno,errno,Level.warn,args);
	}

	public static async severe(grpno:number,errno:number,...args:any) : Promise<void>
	{
		await Messages.show(grpno,errno,Level.severe,args);
	}

	public static async handle(grpno:number,message:string,level:Level) : Promise<void>
	{
		let group:Group = Messages.getGroup(grpno);

		let msg:Message =
		{
			errno: 0,
			grpno: grpno,
			message: message,
			title: group.title
		}

		Alert.handle(msg);
	}

	private static async show(grpno:number,errno:number,level:Level,...args:any) : Promise<void>
	{
		let group:Group = Messages.getGroup(grpno);
		let msg:Message = Messages.get(grpno,errno);

		if (!msg) msg =
		{
			errno: errno,
			grpno: grpno,
			title: "Missing message",
			message: "Unknow error number '"+errno+"' in group'"+grpno+"'"
		}
		else
		{
			msg = {...msg};
			if (!msg.title) msg.title = group.title;
		}

		args?.forEach((arg) =>
		{msg.message = Messages.replace(msg.message,arg)})

		console.log(msg.message)
		Alert.handle(msg);
	}

	private static load(bundle:Bundle) : void
	{
		bundle?.groups.forEach((group) =>
		{
			Messages.groups$.set(group.grpno,group);
			let msgs:Map<number,Message> = Messages.messages$.get(group.grpno);
			if (!msgs) Messages.messages$.set(group.grpno,new Map<number,Message>());
		});

		bundle?.messages.forEach((msg) =>
		{
			let group:Map<number,Message> = Messages.messages$.get(msg.grpno);
			if (group) group.set(msg.errno,msg);
		})
	}

	private static replace(message:string,arg:any) : string
	{
		let pos:number = message.indexOf("%");
		if (pos >= 0) message = message.substring(0,pos) + arg + message.substring(pos+1);
		return(message);
	}
}

export enum Level
{
	fine,
	info,
	warn,
	severe
}