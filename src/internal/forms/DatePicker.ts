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
import { EventType } from "../../control/events/EventType.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { Internals } from "../../application/properties/Internals.js";
import { DatePicker as Properties } from "../../application/properties/DatePicker.js";
import { MouseMap } from "../../../index.js";
import { Field } from "../../view/fields/Field.js";

export class DatePicker extends Form
{
	days_element:HTMLElement= null;
	mth_element: HTMLElement = null;
	pre_mth_element: HTMLElement = null;
	next_mth_element: HTMLElement = null;
	selected_date_element: HTMLInputElement = null;

	date:Date = new Date();
	day:number = this.date.getDate();
	month:number = this.date.getMonth();
	year:number = this.date.getFullYear();

	selectedDate = this.date;
	selectedDay = this.day;
	selectedMonth = this.month;
	selectedYear = this.year;
	input:string = "";

	options:object = { month: 'long'};
	constructor()
	{
		super(DatePicker.page);
		//this.goToNextMonth = this.goToNextMonth.bind(this);
		//this.goToPrevMonth = this.goToPrevMonth.bind(this);
		//this.dateInputFile = this.dateInputFile.bind(this);


		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
		this.addEventListener(this.dateInputFile,{type: EventType.OnEdit, field: "date"});

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
		this.selected_date_element.value = this.formatDate(this.day,Number(this.month + 1),this.year);
		console.log(this.selected_date_element.value)
		return (this.close());
	}

	private async initialize() : Promise<boolean>
	{
		let view:HTMLElement = this.getView();
		Internals.stylePopupWindow(view);

		let value:Date = this.parameters.get("value");
		if (value == null) value = new Date();

		this.setValue("calendar","prev","<");
		this.setValue("calendar","next",">");
		this.setValue("calendar","date",value);
		// this.setValue("calender","mth", this.mth_element)
		this.mth_element = view.querySelector('.mth');
		this.days_element = view.querySelector('.days');
		this.selected_date_element = view.querySelector('input[name="date"]');
		//build datepicker
		this.populateDates()
		this.selected_date_element.value = this.formatDate(this.day,Number(this.month + 1),this.year);

		// this.pre_mth_element.addEventListener('click', this.goToPrevMonth);
		// this.next_mth_element.addEventListener('click', this.goToNextMonth);

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

		

		return(true);
	}


	private async dateInputFile(event:FormEvent) : Promise<boolean>
	{
		
		let date:Date = this.getValue("calendar","date");

		if(date !== null)
		{
		 this.selectedDay = this.date.getDay();
		 this.selectedMonth = this.date.getMonth();
		 this.selectedYear =this.date.getFullYear();
		 console.log(this.selectedDate,this.selectedMonth, this.selectedYear)
		}
		// 
		// this.populateDates();
		return(true)
	}

	private async goToNextMonth () : Promise<boolean>
	{
		console.log("gonext")
		this.month++;
		if(this.month > 11)
		{
			this.month = 0;
			this.year++;
		}
		this.populateDates()

		return(true)
	}

	private async goToPrevMonth() : Promise<boolean>
	{
		console.log("previois")
		this.month--;
		if(this.month < 0)
		{
			this.month = 11;
			this.year--;
		}
		this.populateDates()
		return(true);
	}


	private populateDates() : void
	{
		this.days_element.textContent = '';

		let daysInCurrentMonth = this.getDaysInMonth(this.year, this.month);

		//Found local from browser
		let month_output = new Date(this.year,this.month) .toLocaleDateString('en-us', this.options) + ' ' + this.year
		// this.setValue("calander","mth", month_output)
		this.mth_element.textContent = month_output;

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
			this.days_element.appendChild(day_element)
		}

	}

	private choiceDay(day:number)
	{
		this.selectedDay = day;
		this.selectedMonth = this.month;
		this.selectedYear = this.year;

		this.setValue("calendar", "date", this.formatDate(day,Number(this.month + 1),this.year))
		this.populateDates();
	}

	private formatDate(node1:number,node2:number,node3:number){
		return node1 + '-' + node2 + '-' + node3
	}

	private  getDaysInMonth(year, month): number {
		return new Date(year, month,0).getDate();
	}


	public static page:string =
	Internals.header + Properties.Day +
	`
	<div name="popup-body">
		<div class="date-picker">
			<div class="selected-date"><span>Date</span>:<input name="date" from="calendar" date></div>
			<div class="dates">
				<div class="month">
					<div class="arrows prev-mth" tabindex="0" name="prev" from="calendar"></div>
					<div class="mth" name="mth" from="calendar"></div>
					<div class="arrows next-mth" tabindex="0" name="next" from="calendar"></div>
				</div>
				<div class="days" name="days" tabindex="0" from="calendar"></div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;

}