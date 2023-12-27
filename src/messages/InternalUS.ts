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
import { Message } from "./interfaces/Message.js";

export class InternalUS implements Bundle
{
	public lang:string = "US";
	public name:string = "Internal";

	public groups: Group[] =
	[
		{grpno: 5010, title: "Database Connection"}
	];

	public messages: Message[] =
	[
		{grpno: 5010, errno: 1, message: "Connection scope cannot be changed after connect"},
		{grpno: 5010, errno: 2, message: "Maximum number of locks reached. Transaction will be rolled back in % seconds"},
		{grpno: 5010, errno: 3, message: "Transaction is being rolled back"},
		{grpno: 5010, errno: 4, message: "Transaction will be rolled back in % seconds"},
	];
}
