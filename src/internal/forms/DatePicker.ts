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
import { dates } from "../../model/dates/dates.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { MouseMap } from "../../control/events/MouseMap.js";
import { EventType } from "../../control/events/EventType.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { Internals } from "../../application/properties/Internals.js";
import { DatePicker as Properties } from "../../application/properties/DatePicker.js";
import { FieldProperties } from "../../public/FieldProperties.js";
import { Block } from "../../public/Block.js";

export class DatePicker extends Form
{
	private date:Date = new Date();
	private enabled:FieldProperties;
	private disabled:FieldProperties;
	private day:number = this.date.getDate();

	space:KeyMap = new KeyMap({key:' '});

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
			{type: EventType.Key, field: "prev", key: this.space},
			{type: EventType.Mouse, field: "prev", mouse: MouseMap.click}
		]);

		this.addEventListener(this.goToNextMonth,
		[
			{type: EventType.Key, field: "next", key: this.space},
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

		let props:FieldProperties = this.getBlock("calendar").
			getDefaultProperties("day-11");

		this.enabled = props;
		this.disabled = props.clone().setEnabled(false);

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
		if(event.field == null)
			return(true);

		if(event.field == "prev" || event.field == "next")
			return(true);

		this.day = this.getValue(event.block,event.field);

		this.date.setDate(this.day);
		this.setValue("calendar","date",this.date);

		this.done();
		return(true);
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
		let block:Block = this.getBlock("calendar");
		if(this.date == null) this.date = new Date();
		let month:string = dates.format(this.date,"MMM YYYY");
		let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		let days:number = this.getDaysInMonth(this.date.getFullYear(),this.date.getMonth());
		let firstdaysname:string = this.getDaysNameMonth(this.date.getFullYear(),this.date.getMonth() ,1);

		for (let day = 0; day <= 6; day++)
			this.setValue("calendar","weekday-"+ day, weekdays[day])

		this.setValue("calendar","mth",month);
		for (let week = 1; week <= 6; week++)
		{
			for (let day = 1; day <= 7; day++)
			{
				if(week == 1)
				{
					let theday:number = weekdays.findIndex(element => element == firstdaysname);

					if(theday < day)
					{
						++dayno
						this.setValue("calendar","day-"+week+""+day, dayno);
					}
					else
					{
						this.setValue("calendar","day-"+week+""+day, null);
					}
				}
				else if(++dayno <= days)
				{
					// Enable
					this.setValue("calendar","day-"+week+""+day, dayno);
					block.setDefaultProperties(this.enabled,"day-"+week+""+day);
				}
				else
				{
					// Disable
					this.setValue("calendar","day-"+week+""+day, null);
					block.setDefaultProperties(this.disabled,"day-"+week+""+day);
				}
			}
		}
	}

	private getDaysNameMonth(year:number,month:number,day:number) : string
	{
		return new Date(`${year}-${month + 1}-${day}`).toLocaleDateString("en-US", {weekday: "short"});
	}

	private  getDaysInMonth(year:number, month:number): number
	{
		return new Date(year, month + 1,0).getDate();
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
				<div name="week">
					<div name="day" foreach="weekday in 0..6">
						<span name="weekday-$weekday" from="calendar"></span>
					</div>
				</div>
				<div name="week" foreach="week in 1..6">
					<div name="day" foreach="day in 1..7">
						<span tabindex="-1" name="$day-$week$day" from="calendar"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}