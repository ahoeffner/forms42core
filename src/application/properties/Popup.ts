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
	public header:string =
	`
		<div name="popup" class="canvas-handle">
			<div name="popup-header" class="canvas-handle">
				<div name="close-button" onclick="this.close()">x</div>
			</div>
		</div>
	`;

	public footer:string =
	`
		<div name="popup-footer"></div>
	`;

	public PopupStyle =
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

	public PopupStyleDiv =
	`
		margin-top:10px;
	`;

	public PopupStyleLabel =
	`
		margin-right: 8px;
	`;

	public PopupStyleButtonBar =
	`
		height:30px;
	`;

	public PopupStyleButton =
	`
		gap:3px;
		right:0;
		bottom:0;
		margin:10px;
		position: absolute;
	`;

	public PopupHeaderStyle =
	`
		width: 100%;
		height: 20px;
		position: relative;
		border-bottom: 1px solid black;
	`;

	public PopupFooterStyle = null;

	public PopupCloseButton =
	`
		right: 1px;
		width: 10px;
		height: 20px;
		display: grid;
		cursor: default;
		font-weight: bold;
		position: absolute;
	`;

	public stylePopupWindow(view:HTMLElement) : void
	{

		let body:HTMLElement = view.querySelector('div[name="popup-body"]');
		let close:HTMLElement = view.querySelector('div[name="close-button"]');
		let header:HTMLElement = view.querySelector('div[name="popup-header"]');
		let footer:HTMLElement = view.querySelector('div[name="popup-footer"]');
		let buttonsbar:HTMLElement = view.querySelector('div[name="buttonbar"]');
		let button:HTMLElement = buttonsbar.querySelector('div[name="buttonbar-buttons"]');
		let divs:NodeListOf<HTMLElement> = view.querySelectorAll('div[name="popup-body"] div');
		let labels:NodeListOf<HTMLElement> = view.querySelectorAll('div[name="popup-body"] label');

		if (body && this.PopupStyle) body.style.cssText = this.PopupStyle;
		if (close && this.PopupCloseButton) close.style.cssText = this.PopupCloseButton;
		if (header && this.PopupHeaderStyle) header.style.cssText = this.PopupHeaderStyle;
		if (footer && this.PopupFooterStyle) footer.style.cssText = this.PopupFooterStyle;

		if (this.PopupStyleDiv) divs.forEach((div) => div.style.cssText = this.PopupStyleDiv);
		if (this.PopupStyleLabel) labels.forEach((label) => label.style.cssText = this.PopupStyleLabel);

		if (buttonsbar && this.PopupStyleButtonBar) buttonsbar.style.cssText = this.PopupStyleButtonBar;
		if (button && this.PopupStyleButton) button.style.cssText = this.PopupStyleButton;

		let top:number = view.parentElement.offsetTop;
		let left:number = view.parentElement.offsetLeft;

		left += (view.parentElement.offsetWidth - view.offsetWidth)/1.50;
		top += (view.parentElement.offsetHeight - view.offsetHeight)/4.00;

		view.style.top = top+"px";
		view.style.left = left+"px";
	}
}