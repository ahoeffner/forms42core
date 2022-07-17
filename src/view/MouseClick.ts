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

// Fiters out click from dblclick

export class MouseClick
{
	public type:string = null;
	private event:Event = null;
	private wait$:boolean = false;
	private static DBLClickDetection:number = 200;

	public setEvent(event:Event)
	{
		this.event = event;

		if (this.event.type == "click" || this.event.type == "dblclick")
		{
			if (this.wait$)
				return;

			this.type = "wait";
			this.wait$ = true;
		}
	}

    public get waiting() : boolean
    {
        return(this.wait$);
    }

	public async wait() : Promise<void>
	{
		this.type = "click";

        await new Promise(resolve => setTimeout(resolve,MouseClick.DBLClickDetection));
		while(this.type == "mousedown") await new Promise(resolve => setTimeout(resolve,10));

		this.wait$ = false;
		this.type = this.event.type;
	}
}