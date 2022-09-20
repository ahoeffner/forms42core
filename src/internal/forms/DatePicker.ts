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

import { Form } from "../Form.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { MouseMap } from "../../control/events/MouseMap.js";
import { EventType } from "../../control/events/EventType.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { Internals } from "../../application/properties/Internals.js";
import { DatePicker as Properties } from "../../application/properties/DatePicker.js";
import { dates } from "../../model/dates/dates.js";

export class DatePicker extends Form
{
	date:Date = new Date();
	day:number = this.date.getDate();
	month:number = this.date.getMonth();
	year:number = this.date.getFullYear();

	constructor()
	{
		super(DatePicker.page);

		this.addEventListener(this.initialize,{type: EventType.PostViewInit});

		this.addEventListener(this.setDate,
		[
			{type: EventType.OnEdit, field: "date"},
			{type: EventType.WhenValidateField, field: "date"}
		]);

		this.addEventListener(this.setDay,{type: EventType.Mouse, mouse:MouseMap.click});

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

		this.addEventListener(this.goToPrevMonth,
		[
			{type: EventType.Key, field: "prev", key: KeyMap.enter},
			{type: EventType.Mouse, field: "prev", mouse: MouseMap.click}
		]);

		this.addEventListener(this.goToNextMonth,
		[
			{type: EventType.Key, field: "next", key: KeyMap.enter},
			{type: EventType.Mouse, field: "next", mouse: MouseMap.click}
		]);
	}

	private async done() : Promise<boolean>
	{
		console.log(this.getValue("calendar","date"))
		return (this.close());
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();

		Internals.stylePopupWindow(view);
		Properties.styleDatePicker(view);

		let value:Date = this.parameters.get("value");
		if (value == null) value = new Date();

		this.setValue("calendar","prev","<");
		this.setValue("calendar","next",">");
		this.setValue("calendar","date",value);
		this.setDate();
		this.populateDates();
		return(true);
	}

	private async setDay(event:FormEvent) : Promise<boolean>
	{
		this.day = this.getValue(event.block,event.field);
		if(typeof this.day == "number")
		{
			this.date.setDate(this.day);
			this.setValue("calendar","date",this.date);

			this.populateDates();
			return(true)
		}
		return(false)
	}

	private async setDate() : Promise<boolean>
	{
		this.date = this.getValue("calendar","date");

		this.populateDates();
		return(true)
	}

	private async goToNextMonth () : Promise<boolean>
	{
		this.date.setMonth(this.date.getMonth()+1);

		this.populateDates();
		return(true)
	}

	private async goToPrevMonth() : Promise<boolean>
	{
		this.date.setMonth(this.date.getMonth()-1);

		this.populateDates();
		return(true);
	}

	private populateDates() : void
	{
		let dayno:number = 0;
		if(this.date == null) this.date = new Date();	
		let Lday:string = dates.format(this.date,"MMM YYYY");
		let days:number = this.getDaysInMonth(this.date.getFullYear(),this.date.getMonth());

		this.setValue("calendar","mth",Lday);
		for (let week = 1; week <= 5; week++)
		{
			for (let day = 1; day <= 7; day++)
			{
				if (++dayno <= days)
					this.setValue("calendar","day-"+week+""+day,dayno);
				else
					this.setValue("calendar","day-"+week+""+day,null);
			}
		}
	}

	private  getDaysInMonth(year:number, month:number): number
	{
		return new Date(year, month,0).getDate();
	}

	public static page:string =
	Internals.header +
	`
	<div name="popup-body">
		<div name="date-picker">
			<div><span>Date</span>:<input name="date" from="calendar" date></div>
			<div name="dates">
				<div name="month">
					<div tabindex="0" name="prev" from="calendar"></div>
					<div name="mth" from="calendar"></div>
					<div tabindex="0" name="next" from="calendar"></div>
				</div>
				<div name="week" foreach="week in 1..5">
					<div name="day" foreach="day in 1..7">
						<span tabindex="-1" name="day-$week$day" from="calendar"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;

}