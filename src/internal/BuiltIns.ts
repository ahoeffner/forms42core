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

import { Classes } from "./Classes.js";
import { FormsModule } from "../application/FormsModule.js";

export class BuiltIns
{
	public static callUsernamePasswordForm()
	{
			FormsModule.get().showform(Classes.LoginClass);
	}
}