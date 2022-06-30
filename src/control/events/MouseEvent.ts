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

import { BrowserEvent } from "../../view/BrowserEvent.js";

export class MouseEvent
{
	public static Click:MouseEvent = new MouseEvent();
	public static DBLClick:MouseEvent = new MouseEvent();
	public static ContextMenu:MouseEvent = new MouseEvent();

	public static parseBrowserEvent(event:BrowserEvent) : MouseEvent
	{
		if (event.type == "click") return(MouseEvent.Click);
		else if (event.type == "dblclick") return(MouseEvent.DBLClick);
		else if (event.type == "contextmenu") return(MouseEvent.ContextMenu);
	}
}