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
import { Block } from "../../public/Block.js";
import { dates } from "../../model/dates/dates.js";
import { KeyMap } from "../../control/events/KeyMap.js";
import { KeyCodes } from "../../control/events/KeyCodes.js";
import { MouseMap } from "../../control/events/MouseMap.js";
import { EventType } from "../../control/events/EventType.js";
import { FormEvent } from "../../control/events/FormEvent.js";
import { FieldProperties } from "../../public/FieldProperties.js";
import { Internals } from "../../application/properties/Internals.js";
import { DatePicker as Properties } from "../../application/properties/DatePicker.js";

export class DatePicker extends Form
{
	private date:Date = new Date();
	private enabled:FieldProperties;
	private disabled:FieldProperties;
	private leftArrow:HTMLElement = null;
	private rightArrow:HTMLElement = null;
	private day:number = this.date.getDate();
	private prevstep:KeyMap = new KeyMap({key: KeyCodes.ArrowLeft});
	private nextstep:KeyMap = new KeyMap({key: KeyCodes.ArrowRight});

	constructor()
	{
		super(DatePicker.page);

		this.addEventListener(this.initialize,{type: EventType.PostViewInit});

		this.addEventListener(this.setDate,
		[
			{type: EventType.OnEdit, field: "date"},
			{type: EventType.WhenValidateField, field: "date"}
		]);

		this.leftArrow = document.createElement("span");
		this.rightArrow = document.createElement("span");

		this.leftArrow.innerHTML = "&#11164;";
		this.rightArrow.innerHTML = "&#11166;";

		this.addEventListener(this.navigate,
		[
			{type: EventType.Key, key: this.prevstep},
			{type: EventType.Key, key: this.nextstep},
			{type: EventType.Key, key: KeyMap.prevrecord},
			{type: EventType.Key, key: KeyMap.nextrecord},
		]);

		this.addEventListener(this.setDay,{type: EventType.Mouse, mouse:MouseMap.click});

		this.addEventListener(this.done,{type: EventType.Key, key: KeyMap.enter});
		this.addEventListener(this.close,{type: EventType.Key, key: KeyMap.escape});

		this.addEventListener(this.goToPrevMonth,
		[
			{type: EventType.Key, field: "prev", key: KeyMap.space},
			{type: EventType.Mouse, field: "prev", mouse: MouseMap.click}
		]);

		this.addEventListener(this.goToNextMonth,
		[
			{type: EventType.Key, field: "next", key: KeyMap.space},
			{type: EventType.Mouse, field: "next", mouse: MouseMap.click}
		]);
	}

	private async done() : Promise<boolean>
	{
		let form:Form = this.parameters.get("form");
		let block:string = this.parameters.get("block");
		let field:string = this.parameters.get("field");

		form.setValue(block,field,this.date);
		this.setValue("calendar","date",this.date);

		console.log(this.date);

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
		
		this.setValue("calendar","prev",this.leftArrow);
		this.setValue("calendar","next",this.rightArrow);
		this.setValue("calendar","date",value);

		this.setDate();
		return(true);
	}

	private async navigate(event:FormEvent) : Promise<boolean>
	{
		let prev:boolean = event.key == KeyMap.prevrecord;
		let next:boolean = event.key == KeyMap.nextrecord;

		let left:boolean = event.key == this.prevstep;
		let right:boolean = event.key == this.nextstep;
		
		let row:number = +event.field.substring(4,5);
		let col:number = +event.field.substring(5,6);
		
		if (next)
		{
			if (this.getValue(event.block,'day-' + (++row) + col))
			{
				this.goField(event.block,'day-' + row + col);
				return(false);
			}
		}
		else if (prev)
		{
			if (this.getValue(event.block,'day-' + (--row) + col))
			{
				this.goField(event.block,'day-' + row + col);
				return(false);
			}
		} 
		else if (right)
		{
			if (this.getValue(event.block,'day-' + row + (++col)))
			{
				this.goField(event.block,'day-' + row + col);
				return(false);
			}
		}
		else if (left)
		{
			if (this.getValue(event.block,'day-' + row + (--col)))
			{
				this.goField(event.block,'day-' + row + col);
				return(false);
			}
		}
	
		return(true);
	}

	private async setDay(event:FormEvent) : Promise<boolean>
	{
		if(event.field == null)
			return(true);
		if(event.field == "prev" || event.field == "next" || event.field == "date" || event.field == "mth")
			return(true);

		if(event.field.substring(0,7) == "weekday")
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
		this.setValue("calendar","date",this.date);
		this.populateDates();
		return(true)
	}

	private async goToPrevMonth() : Promise<boolean>
	{
		this.date.setMonth(this.date.getMonth()-1);
		this.setValue("calendar","date",this.date);
		this.populateDates();
		return(true);
	}

	private populateDates() : void
	{
		let dayno:number = 0;
		let block:Block = this.getBlock("calendar");
		if(this.date == null) this.date = new Date();
		let weekdays:Array<String> = dates.startDays("Sun");
		let month:string = dates.format(this.date,"MMM YYYY");

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
						block.setDefaultProperties(this.enabled,"day-"+week+""+day);
					}
					else
					{
						this.setValue("calendar","day-"+week+""+day, null);
						block.setDefaultProperties(this.disabled,"day-"+week+""+day);
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
						<span tabindex="-1" name="day-$week$day" from="calendar"></span>
					</div>
					
				</div>
			</div>
		</div>
	</div>
	`
	+ Internals.footer;
}