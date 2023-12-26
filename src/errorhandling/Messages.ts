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
		Messages.language$ = language;
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

		Messages.load(bundle);
	}

	public static get bundles() : Bundle[]
	{
		return(Messages.files$);
	}

	public static async info(grpno:number,errno:number) : Promise<void>
	{
		await Messages.show(grpno,errno,Level.info);
	}

	public static getGroup(grpno:number) : Group
	{
		return(Messages.groups$.get(grpno));
	}

	public static getMessage(grpno:number,errno:number) : Message
	{
		let msg:Message = null;
		let group:Map<number,Message> = Messages.messages$.get(grpno);
		if (group) msg = group.get(errno);
		return(msg);
	}

	private static async show(grpno:number,errno:number,level:Level) : Promise<void>
	{
		let group:Group = Messages.getGroup(grpno);
		let msg:Message = Messages.getMessage(grpno,errno);

		if (!msg) msg =
		{
			grpno: grpno,
			errno: errno,
			level: level,
			title: "Missing message",
			message: "Unknow error number '"+errno+"' in group'"+grpno+"'"
		}
		else
		{
			msg = {...msg};
			msg.level = level;

			if (msg.ignore == null)
			{
				msg.ignore = group.ignore;
				if (msg.ignore == null) msg.ignore = false;
			}
		}

		Alert.handle(msg);
	}

	private static load(bundle:Bundle) : void
	{
		bundle.groups.forEach((group) =>
		{
			Messages.groups$.set(group.grpno,group);
			let msgs:Map<number,Message> = Messages.messages$.get(group.grpno);
			if (!msgs) Messages.messages$.set(group.grpno,new Map<number,Message>());
		});

		bundle.messages.forEach((msg) =>
		{
			let group:Map<number,Message> = Messages.messages$.get(msg.grpno);
			if (group) group.set(msg.errno,msg);
		})
	}
}

export enum Level
{
	info,
	warn,
	fatal
}