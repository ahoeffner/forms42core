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

import { Internals } from "../../application/properties/Internals.js";

export class Loading
{
	private static loader = null;
	private static threads:number = 0;

	private view:HTMLDivElement = null;
	private element:HTMLElement = null;

	public static show(message:string) : void
	{
		console.log("show "+Loading.threads);

		if (Loading.loader == null)
			Loading.loader = new Loading();

		Loading.threads++;
		Loading.loader?.setMessage(message);
		setTimeout(() => {Loading.loader?.display()},10);
	}

	public static hide() : void
	{
		if (--Loading.threads <= 0)
		{
			Loading.loader?.remove();
			Loading.loader = null;
		}

		console.log("hide "+Loading.threads);
	}

	private constructor()
	{
		this.view = document.createElement("div");

		this.view.innerHTML = Loading.page;
		this.element = document.activeElement as HTMLElement;
	}

	public display() : void
	{
		if (this.view.parentElement == null)
		{
			console.log("do display")
			document.body.appendChild(this.view);
			Internals.stylePopupWindow(this.view);
			this.view.style.zIndex = Number.MAX_SAFE_INTEGER+"";
		}
	}

	public remove() : void
	{
		if (Loading.loader != null)
		{
			this.view.remove();
			this.element.focus();
		}
	}

	public setMessage(message:string)
	{
		this.view.querySelector('div[name="msg"]').
			textContent = message;
	}

	public static page:string =
	`
		<div style="position:absolute; top:0; left:0; width: 100%; height: 100%">
			<div name="msg" from="loading"></div>
			<div name="loading"></div>
		</div>
	`
}
