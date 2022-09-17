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
			<div name="popup-header" class="canvas-handle">
				<div name="close-button" onclick="this.close()">x</div>
			</div>
		</div>
	`;

	public static footer:string =
	`
		<div name="popup-footer"></div>
	`;

	public static PopupStyle =
	`
		gap:2px;
		margin:10px;
		display:grid;
		overflow: hidden;
		padding:10px 20px;
		align-items: center;
		align-content: center;
		justify-content: center;
	`;

	public static PopupStyleDiv =
	`
		margin-top:10px;
	`;

	public static PopupStyleLabel =
	`
		margin-right: 8px;
	`;

	public static PopupStyleButtonBar =
	`
		height:30px;
	`;

	public static PopupStyleButton =
	`
		gap:3px;
		right:0;
		bottom:0;
		margin:10px;
		position: absolute;
	`;

	public static PopupHeaderStyle =
	`
		width: 100%;
		height: 20px;
		position: relative;
		border-bottom: 1px solid black;
	`;

	public static PopupFooterStyle = null;

	public static PopupCloseButton =
	`
		right: 1px;
		width: 10px;
		height: 20px;
		display: grid;
		cursor: default;
		font-weight: bold;
		position: absolute;
	`;

	public static stylePopupWindow(view:HTMLElement) : void
	{

		let body:HTMLElement = view.querySelector('div[name="popup-body"]');
		let close:HTMLElement = view.querySelector('div[name="close-button"]');
		let header:HTMLElement = view.querySelector('div[name="popup-header"]');
		let footer:HTMLElement = view.querySelector('div[name="popup-footer"]');
		let buttonbar:HTMLElement = view.querySelector('div[name="buttonbar"]');

		let divs:NodeListOf<HTMLElement> = view.querySelectorAll('div[name="popup-body"] div');
		let labels:NodeListOf<HTMLElement> = view.querySelectorAll('div[name="popup-body"] label');
		let buttons:NodeListOf<HTMLElement> = buttonbar.querySelectorAll('div[name="buttonbar-buttons"]');

		if (body && Popup.PopupStyle) body.style.cssText = Popup.PopupStyle;
		if (close && Popup.PopupCloseButton) close.style.cssText = Popup.PopupCloseButton;
		if (header && Popup.PopupHeaderStyle) header.style.cssText = Popup.PopupHeaderStyle;
		if (footer && Popup.PopupFooterStyle) footer.style.cssText = Popup.PopupFooterStyle;

		if (Popup.PopupStyleDiv) divs.forEach((div) => div.style.cssText = Popup.PopupStyleDiv);
		if (Popup.PopupStyleLabel) labels.forEach((label) => label.style.cssText = Popup.PopupStyleLabel);

		if (buttonbar && Popup.PopupStyleButtonBar) buttonbar.style.cssText = Popup.PopupStyleButtonBar;
		if (buttons && Popup.PopupStyleButton) buttons.forEach((button) => button.style.cssText = Popup.PopupStyleButton);

		let top:number = view.parentElement.offsetTop;
		let left:number = view.parentElement.offsetLeft;

		left += (view.parentElement.offsetWidth - view.offsetWidth)/1.50;
		top += (view.parentElement.offsetHeight - view.offsetHeight)/4.00;

		view.style.top = top+"px";
		view.style.left = left+"px";
	}
}