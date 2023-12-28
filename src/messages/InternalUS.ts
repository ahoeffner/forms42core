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

import { MSGGRP } from "./Internal.js";
import { Group } from "./interfaces/Group.js";
import { Bundle } from "./interfaces/Bundle.js";
import { Message } from "./interfaces/Message.js";


export class InternalUS implements Bundle
{
	public lang:string = "US";
	public name:string = "Internal";

	public groups: Group[] =
	[
		{grpno: MSGGRP.SQL, title: "Database"},
		{grpno: MSGGRP.TRX, title: "Transaction"},
		{grpno: MSGGRP.ORDB, title: "OpenRestDB"},
	];

	public messages: Message[] =
	[
		{grpno: MSGGRP.TRX, errno: 0, message: ""},
		{grpno: MSGGRP.TRX, errno: 1, message: "Transactions successfully saved", important: true},
		{grpno: MSGGRP.TRX, errno: 2, message: "Failed to push transactions to backend"},
		{grpno: MSGGRP.TRX, errno: 3, message: "Failed to undo transactions for form '%'"},
		{grpno: MSGGRP.TRX, errno: 4, message: "Failed to roll back transactions"},
		{grpno: MSGGRP.TRX, errno: 5, message: "Transactions successfully rolled back", important: true},
		{grpno: MSGGRP.TRX, errno: 6, message: "Maximum number of locks reached. Transaction will be rolled back in % seconds"},
		{grpno: MSGGRP.TRX, errno: 7, message: "Transaction is being rolled back"},
		{grpno: MSGGRP.TRX, errno: 8, message: "Transaction will be rolled back in % seconds"},

		{grpno: MSGGRP.ORDB, errno: 1, message: "Connection scope cannot be changed after connect"},
	];
}
