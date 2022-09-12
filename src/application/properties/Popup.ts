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

export class Popup
{
	public static header:string =
	`
		<div name="popup" class="canvas-handle">
			<div name="popup-header">
				<div name="close-button" onclick="this.close()">x</div>
			</div>
		</div>
	`;

	public static footer:string =
	`
		<div name="popup-footer" ></div>
	`;

	public static PopupStyle =
	`
		display: grid;
		position: relative;
		width: fit-content;
		height: fit-content;
	`;


	public static PopupHeaderStyle =
	`
		width: 100%;
		height: 20px;
		position: relative;
		border: 1px solid black;
	`;

	public static PopupFooterStyle = null;

	public static PopupCloseButton =
	`
		left: 10px;
		width: 10px;
		height: 20px;
		display: grid;
		position: relative;
		border: 1px solid black;
	`;

	public static stylePopupWindow(view:HTMLElement) : void
	{
		let close:HTMLElement = view.querySelector('div[name="close-button"]');
		let header:HTMLElement = view.querySelector('div[name="popup-header"]');
		let footer:HTMLElement = view.querySelector('div[name="popup-footer"]');

		if (Popup.PopupStyle) view.style.cssText = Popup.PopupStyle;
		if (close && Popup.PopupCloseButton) close.style.cssText = Popup.PopupCloseButton;
		if (header && Popup.PopupHeaderStyle) header.style.cssText = Popup.PopupHeaderStyle;
		if (footer && Popup.PopupFooterStyle) footer.style.cssText = Popup.PopupFooterStyle;
	}
}