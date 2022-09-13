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
		margin:20px;
		display:grid;
		overflow: hidden;
		padding:10px 20px;
		align-items: center;
		align-content: center;
		justify-content: center;
	`;

	public static PopupStyleDiv =
	`
		margin: 10px 5px;
		display: inline-flex;
	`;

	public static PopupStyleLabel =
	`
		margin-right: 8px;
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
		let close:HTMLElement = view.querySelector('div[name="close-button"]');
		let header:HTMLElement = view.querySelector('div[name="popup-header"]');
		let footer:HTMLElement = view.querySelector('div[name="popup-footer"]');
		let style:HTMLElement = view.querySelector('div[name="filter-editor"]');
		let divstyle:HTMLElement = view.querySelector('div[name="filter-editor"] div');
		let labelstyle:HTMLElement = view.querySelector('div[name="filter-editor"] label');

		if (style && Popup.PopupStyle) style.style.cssText = Popup.PopupStyle;
		if (divstyle && Popup.PopupStyleDiv) divstyle.style.cssText = Popup.PopupStyleDiv;
		if (close && Popup.PopupCloseButton) close.style.cssText = Popup.PopupCloseButton;
		if (header && Popup.PopupHeaderStyle) header.style.cssText = Popup.PopupHeaderStyle;
		if (footer && Popup.PopupFooterStyle) footer.style.cssText = Popup.PopupFooterStyle;
		if (labelstyle && Popup.PopupStyleLabel) labelstyle.style.cssText = Popup.PopupStyleLabel;
	}
}