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

import { Alert } from "../application/Alert";
import { Messages } from "./Messages";
import { Message } from "./interfaces/Message";

export class ErrorHandler
{
	private static messages:Map<number,Map<number,Message>> =
		new Map<number,Map<number,Message>>();


	public static reload() : void
	{
		Messages.bundles.forEach((bundle) =>
		{
			bundle.groups.forEach((group) =>
			{
				let msgs:Map<number,Message> = new Map<number,Message>();
				ErrorHandler.messages.set(group.grpno,msgs);
			});

			bundle.messages.forEach((msg) =>
			{
				let group:Map<number,Message> = ErrorHandler.messages.get(msg.grpno);
				if (group) group.set(msg.errno,msg);
			})
		})
	}

	public static handle(grpno:number,errno:number,level?:level) : void
	{
		let msg:Message = ErrorHandler.getMessage(grpno,errno);

		if (!msg) msg =
		{
			grpno: grpno,
			errno: errno,
			title: "Missing message",
			message: "Unknow error number '"+errno+"' in group'"+grpno+"'"
		}

		Alert.handle(msg);
	}

	public static fatal(grpno:number,errno:number,level?:level) : void
	{

	}

	public static warning(grpno:number,errno:number,level?:level) : void
	{
	}

	public static getMessage(grpno:number,errno:number) : Message
	{
		let msg:Message = null;
		let group:Map<number,Message> = ErrorHandler.messages.get(grpno);
		if (group) msg = group.get(errno);
		return(msg);
	}
}


export enum level
{
	info,
	warn,
	fatal
}