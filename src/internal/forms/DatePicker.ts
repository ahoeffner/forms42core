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

		let value:Date = this.parameters.get("value");
		if (value == null) value = new Date();
		console.log("value : "+value);

		this.setValue("calendar","prev","<");
		this.setValue("calendar","next",">");
		this.setValue("calendar","date",value);

		this.populateDates();
		return(true);
	}


	private async setDate() : Promise<boolean>
	{
		this.date = this.getValue("calendar","date");
		console.log(this.date)
		return(true)
	}

	private async goToNextMonth () : Promise<boolean>
	{
		this.date.setMonth(this.date.getMonth()+1);
		console.log("next "+this.date);
		//this.populateDates()
		return(true)
	}

	private async goToPrevMonth() : Promise<boolean>
	{
		this.date.setMonth(this.date.getMonth()-1);
		console.log("previous "+this.date);
		//this.populateDates()
		return(true);
	}


	private populateDates() : void
	{
		let dayno:number = 0;
		let days:number = this.getDaysInMonth(this.year,this.month);

		for (let week = 0; week < 5; week++)
		{
			for (let day = 0; day < 7; day++)
			{
				if (++dayno < days)
					this.setValue("calendar","day-"+week+""+day,dayno);
			}
		}

		/*
		//this.days_element.textContent = '';


		//Found local from browser
		let month_output = new Date(this.year,this.month) .toLocaleDateString('en-us', this.options) + ' ' + this.year
		// this.setValue("calander","mth", month_output)
		//this.mth_element.textContent = month_output;

		for(let day = 1; day < daysInCurrentMonth + 1; day++)
		{
			let day_element = document.createElement('div');
			day_element.classList.add('day');
			day_element.textContent = day.toString();
			if(this.selectedDay == day && this.selectedYear == this.year && this.selectedMonth + 1 == this.month + 1)
			{
				this.day = day;
				day_element.classList.add('selected');
			}
			// this.addEventListener(day_element,{block:"calender", field:"days"})
			day_element.addEventListener('click',() => this.choiceDay(day))
			//this.days_element.appendChild(day_element)
		}
		*/
	}

	private choiceDay(day:number)
	{
		this.populateDates();
	}

	private  getDaysInMonth(year, month): number
	{
		return new Date(year, month,0).getDate();
	}


	public static page:string =
	Internals.header + Properties.Day +
	`
	<div name="popup-body">
		<div class="date-picker">
			<div><span>Date</span>:<input name="date" from="calendar" date></div>
			<div class="dates">
				<div class="month">
					<div class="arrows" tabindex="0" name="prev" from="calendar"></div>
					<div class="mth" name="mth" from="calendar"></div>
					<div class="arrows" tabindex="0" name="next" from="calendar"></div>
				</div>
				<div class="week" foreach="week in 1..5">
					<div class="day" foreach="day in 1..7">
						<span tabindex="-1" name="day-$week$day" from="calendar"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;

}