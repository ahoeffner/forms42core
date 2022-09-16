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
import { Popup } from "../../application/properties/Popup.js";
import { Console } from "console";
import { FormEvent } from "../../../index.js";

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
		this.goToNextMonth = this.goToNextMonth.bind(this);
		this.goToPrevMonth = this.goToPrevMonth.bind(this);
		this.dateInputFile = this.dateInputFile.bind(this);
		this.addEventListener(this.initialize,{type: EventType.PostViewInit});
		this.addEventListener(this.dateInputFile,{type: EventType.OnEdit, field: "date"});
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
		Popup.stylePopupWindow(view);
		
		this.days_element = view.querySelector('.days');
		this.mth_element = view.querySelector('.mth')
		this.pre_mth_element = view.querySelector('.prev-mth');
		this.next_mth_element = view.querySelector('.next-mth');
		this.selected_date_element = view.querySelector('input[name="date"]');
		//build datepicker
		this.populateDates()
		this.selected_date_element.value = this.formatDate(this.day,Number(this.month + 1),this.year);
		
		this.pre_mth_element.addEventListener('click', this.goToPrevMonth);
		this.next_mth_element.addEventListener('click', this.goToNextMonth);

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

		return(true);
	}

	
	private async dateInputFile(e : FormEvent) : Promise<boolean>
	{
		console.log(this.getValue("fields", "date"))

		// [this.day,this.month,this.year] = e.target["value"].split("-");
		// this.month--;
		// this.selectedDay = this.day;
		// this.selectedMonth = this.month;
		// this.selectedYear = this.year;	

		// this.populateDates();
		return(true)
	}

	private goToNextMonth()
	{
		this.month++;
		if(this.month > 11)
		{
			this.month = 0;
			this.year++;
		}
		this.populateDates()
	}

	private goToPrevMonth()
	{
		this.month--;
		if(this.month < 0)
		{
			this.month = 11;
			this.year--;
		}
		this.populateDates()
	}
	

	private populateDates()
	{
		this.days_element.textContent = '';
		
		let daysInCurrentMonth = this.getDaysInMonth(this.year, this.month);

		//Found local from browser
		this.mth_element.textContent = new Date(this.year,this.month) .toLocaleDateString('en-us', this.options) + ' ' + this.year;

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
			day_element.addEventListener('click',() => this.choiceDay(day))
			this.days_element.appendChild(day_element)
		}
	}

	private choiceDay(day:number)
	{
		this.selectedDay = day;
		this.selectedMonth = this.month;
		this.selectedYear = this.year;
		this.selected_date_element.value = this.formatDate(day,Number(this.month + 1),this.year);
		this.populateDates();
	}

	private formatDate(node1:number,node2:number,node3:number){
		return node1 + '-' + node2 + '-' + node3
	}
	
	private  getDaysInMonth(year, month): number {
		return new Date(year, month,0).getDate();
	}


	public static page:string =
	Popup.header +
	`
	<div name="popup-body">
		<div class="date-picker">
			<div class="selected-date"><span>Date</span>:<input name="date" from="fields" date></div>
			<div class="dates">
				<div class="month">
					<div class="arrows prev-mth">&lt;</div>
					<div class="mth"></div>
					<div class="arrows next-mth">&gt;</div>
				</div>
				<div class="days"></div>
			</div>
		</div>
	</div>
	`
	+ Popup.footer;

}