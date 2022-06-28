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

import { Pattern } from "../Pattern.js";
import { DataType } from "./DataType.js";
import { Section } from "../interfaces/Pattern.js";
import { BrowserEvent } from "../../BrowserEvent.js";
import { HTMLProperties } from "../HTMLProperties.js";
import { FieldProperties } from "../../FieldProperties.js";
import { FieldEventHandler } from "../interfaces/FieldEventHandler.js";
import { DatePart, dates, DateToken, FormatToken } from "../../../model/dates/dates.js";
import { FieldImplementation, FieldState } from "../interfaces/FieldImplementation.js";
import { Alert } from "../../../application/Alert.js";

enum Case
{
	upper,
	lower,
	mixed,
	initcap
}


export class Input implements FieldImplementation, EventListenerObject
{
	private type:string = null;
	private before:string = "";
	private initial:string = "";
    private int:boolean = false;
    private dec:boolean = false;
	private cse:Case = Case.mixed;
	private pattern:Pattern = null;
	private state:FieldState = null;
    private placeholder:string = null;
	private datetokens:FormatToken[] = null;
	private properties:HTMLProperties = null;
	private eventhandler:FieldEventHandler = null;

	private element:HTMLInputElement = null;
	private datatype:DataType = DataType.string;
    private event:BrowserEvent = BrowserEvent.get();

	public create(eventhandler:FieldEventHandler, _tag:string) : HTMLInputElement
	{
		this.element = document.createElement("input");
		this.eventhandler = eventhandler;
		return(this.element);
	}

	public apply(properties:HTMLProperties) : void
	{
		this.properties = properties;
		properties.apply(this.element);
		this.setAttributes(properties.getAttributes());
		if (properties.init) this.addEvents(this.element);
	}

	public getFieldState() : FieldState
	{
		return(this.state);
	}

	public setFieldState(state:FieldState) : void
	{
		this.state = state;
		let enabled:boolean = this.properties.enabled;
		let readonly:boolean = this.properties.readonly;

		switch(state)
		{
			case FieldState.OPEN:
				if (enabled) FieldProperties.setEnabledState(this.element,this.properties,true);
				if (!readonly) FieldProperties.setReadOnlyState(this.element,this.properties,false);
				break;

			case FieldState.READONLY:
				if (enabled) FieldProperties.setEnabledState(this.element,this.properties,true);
				FieldProperties.setReadOnlyState(this.element,this.properties,true);
				break;

			case FieldState.DISABLED:
				FieldProperties.setEnabledState(this.element,this.properties,false);
				break;
			}
	}

    public getValue() : any
    {
		return(this.getObject(this.element.value));
    }

    public setValue(value:any) : boolean
    {
        if (value == null)
			value = "";

		if (!this.validate(value))
			return(false);

		if (this.pattern != null && value.length > 0)
		{
			this.pattern.setValue(value);
			value = this.pattern.getValue();
		}

		this.before = value;
		this.initial = value;

		this.element.value = value+"";
		return(true);
    }

	public getIntermediateValue(): string
	{
		let value:string = this.element.value;
		if (this.pattern == null) value = value.trim();
		return(value);
	}

	public setIntermediateValue(value:string) : void
	{
        if (value == null)
			value = "";

		value = value.trim();

		if (this.pattern != null && value.length > 0)
		{
			this.pattern.setValue(value);
			value = this.pattern.getValue();
		}

		this.before = value;
		this.initial = value;

		this.element.value = value;
	}

	public getElement() : HTMLElement
	{
		return(this.element);
	}

    public setAttributes(attributes:Map<string,any>) : void
    {
		this.int = false;
		this.dec = false;
		this.pattern = null;
		this.cse = Case.mixed;
		this.placeholder = null;
		this.datatype = DataType.string;

		let datesize:number = 0;
		let datepattern:string = "";
		let types:FormatToken[] = dates.tokenizeFormat();

		this.type = attributes.get("type");
		if (this.type == null) this.type = "text";

		if (this.type == "number")
			this.datatype = DataType.integer;

		if (this.type == "date")
			this.datatype = DataType.date;

		if (this.type == "datetime")
			this.datatype = DataType.datetime;

        attributes.forEach((value,attr) =>
        {
			if (attr == "upper")
				this.cse = Case.upper;

			if (attr == "lower")
				this.cse = Case.lower;

			if (attr == "initcap")
				this.cse = Case.initcap;

			if (attr == "integer")
			{
				this.int = true;
				this.datatype = DataType.integer;
			}

			if (attr == "decimal")
			{
				this.dec = true;
				this.datatype = DataType.decimal;
			}

			if (attr == "date" || attr == "datetime")
			{
				this.datetokens = [];
				let parts:number = 3;
				this.placeholder = "";

				this.datatype = DataType.date;
				types = dates.tokenizeFormat();

				types.forEach((type) =>
				{
					if (type.type == DatePart.Year)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}

					if (type.type == DatePart.Month)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}

					if (type.type == DatePart.Day)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}
				})
			}

			if (attr == "datetime")
			{
				let parts:number = 3;
				this.datatype = DataType.datetime;

				datesize++;
				datepattern += " ";
				this.placeholder += " ";

				types.forEach((type) =>
				{
					if (type.type == DatePart.Hour)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}

					if (type.type == DatePart.Minute)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}

					if (type.type == DatePart.Second)
					{
						parts--;
						datesize += type.length;
						this.datetokens.push(type);
						this.placeholder += type.mask;
						datepattern += "{"+type.length+"#}";

						if (parts > 0)
						{
							datesize++;
							datepattern += type.delimitor;
							this.placeholder += type.delimitor;
						}
					}
				})
			}

			if (attr == "format")
				this.pattern = new Pattern(value);

			if (attr == "placeholder")
				this.placeholder = value;
        });

		if (datepattern.length > 0)
		{
			if (this.element.getAttribute("size") == null)
				this.element.setAttribute("size",""+datesize);

			this.pattern = new Pattern(datepattern);
			this.placeholder = this.placeholder.toLowerCase();
		}

		this.element.removeAttribute("placeholder");
    }

    public async handleEvent(event:Event) : Promise<void>
    {
        let buble:boolean = false;
        this.event.setEvent(event);
		this.event.modified = false;

        if (this.event.type == "focus")
        {
			buble = true;
			this.initial = this.getIntermediateValue();
			if (this.pattern != null) this.initial = this.pattern.getValue();

			if (this.placeholder != null)
				this.element.removeAttribute("placeholder");
        }

        if (this.pattern != null)
        {
            if (!this.xfixed())
                return;
        }

        if (this.event.type == "blur")
        {
			buble = true;
			let change:boolean = false;

			if (this.pattern == null)
			{
				if (this.getIntermediateValue() != this.initial)
					change = true;
			}
			else
			{
				if (this.pattern.getValue() != this.initial)
					change = true;
			}

			if (change)
			{
				this.event.type = "change";

				if (this.pattern != null)
				{
					this.pattern.setValue(this.getElementValue());

					if (this.pattern.isNull()) this.setElementValue(null);
					else					   this.setElementValue(this.pattern.getValue());
				}

				this.eventhandler.handleEvent(this.event);
				this.event.type = "blur";
			}

			this.initial = this.getIntermediateValue();
			if (this.pattern != null) this.initial = this.pattern.getValue();

            if (this.placeholder != null)
				this.element.removeAttribute("placeholder");
        }

        if (!this.disabled && this.event.type == "mouseover" && this.placeholder != null && !this.event.focus)
            this.element.setAttribute("placeholder",this.placeholder);

        if (this.event.type == "mouseout" && this.placeholder != null && !this.event.focus)
            this.element.removeAttribute("placeholder");

        this.event.preventDefault();

        if (this.int)
        {
            if (!this.xint())
                return;
        }

        if (this.dec)
        {
            if (!this.xdec())
                return;
        }

		if (this.cse != Case.mixed)
		{
			if (!this.xcase())
				return;
		}

		if (this.event.navigation) buble = true;
		else if (this.event.ignore) return;

		if (event.type == "change")
		{
			buble = false;

			if (this.datatype == DataType.integer || this.datatype == DataType.decimal)
			{
				let num:string = this.getElementValue();
				if (num.trim().length > 0) this.setElementValue((+num)+"");
			}

			if (this.pattern == null)
			{
				if (this.getIntermediateValue() != this.initial)
					buble = true;
			}
			else
			{
				this.pattern.setValue(this.getElementValue());

				if (this.pattern.isNull()) this.setElementValue(null);
				else					   this.setElementValue(this.pattern.getValue());

				if (this.pattern.getValue() != this.initial)
					buble = true;
			}

			this.initial = this.getIntermediateValue();
			if (this.pattern != null) this.initial = this.pattern.getValue();
		}

		if (this.event.type.startsWith("mouse"))
			buble = true;

		if (this.event.onScrollUp)
			buble = true;

        if (this.event.onScrollDown)
			buble = true;

        if (this.event.onCtrlKeyDown)
			buble = true;

        if (this.event.onFuncKey)
			buble = true;

		let after:string = this.getIntermediateValue();

		if (this.before != after)
		{
			buble = true;
			this.before = after;
			this.event.modified = true;
		}

		if (this.event.accept || this.event.cancel)
			buble = true;

        if (buble)
			await this.eventhandler.handleEvent(this.event);
    }

	private xcase() : boolean
	{
		if (this.type == "range")
			return(true);

		if (this.element.readOnly)
			return(true);

		if (this.event.type == "keydown" && this.event.isPrintableKey)
		{
			if (this.event.ctrlkey != null || this.event.funckey != null)
				return(false);

			this.event.preventDefault(true);
			let pos:number = this.getPosition();
			let sel:number[] = this.getSelection();
			let value:string = this.getElementValue();

			if (sel[1] - sel[0] > 0)
				value = value.substring(0,sel[0]) + value.substring(sel[1])

			if (pos >= value.length) value += this.event.key;
			else value = value.substring(0,pos) + this.event.key + value.substring(pos);

			if (this.cse == Case.upper)
				value = value.toLocaleUpperCase();

			if (this.cse == Case.lower)
				value = value.toLocaleLowerCase();

			if (this.cse == Case.initcap)
			{
				let cap:boolean = true;
				let initcap:string = "";

				for (let i = 0; i < value.length; i++)
				{
					if (cap) initcap += value.charAt(i).toLocaleUpperCase();
					else 	 initcap += value.charAt(i).toLocaleLowerCase();

					cap = false;
					if (value.charAt(i) == ' ')
						cap = true;
				}

				value = initcap;
			}


			this.setElementValue(value);
			this.setPosition(pos+1);
		}

		return(true);
	}

    private xint() : boolean
    {
		if (this.type == "range")
			return(true);

		if (this.element.readOnly)
			return(true);

        let pos:number = this.getPosition();

        if (this.event.type == "keydown")
        {
            if (this.event.isPrintableKey)
            {
                let pass:boolean = false;

                if (this.event.key >= '0' && this.event.key <= '9')
                    pass = true;

                if (this.event.key == "-" && !this.element.value.includes("-"))
                    pass = true;

                if (!pass)
                {
                    this.event.preventDefault(true);
                }
                else if (this.event.repeat && this.event.key != ".")
                {
                    let value:string = this.element.value;

                    let a:string = value.substring(pos);
                    let b:string = value.substring(0,pos);

                    this.setElementValue(b + this.event.key + a);
                    this.setPosition(++pos);
                }
            }
        }

        return(true);
    }

    private xdec() : boolean
    {
		if (this.type == "range")
			return(true);

		if (this.element.readOnly)
			return(true);

        let pos:number = this.getPosition();

        if (this.event.type == "keydown")
        {
            if (this.event.isPrintableKey)
            {
                let pass:boolean = false;

                if (this.event.key >= '0' && this.event.key <= '9')
                    pass = true;

                if (this.event.key == "." && !this.element.value.includes("."))
                    pass = true;

				if (this.event.key == "-" && !this.element.value.includes("-"))
                    pass = true;

                if (!pass)
                {
                    this.event.preventDefault(true);
                }
                else if (this.event.repeat && this.event.key != ".")
                {
                    let value:string = this.element.value;

                    let a:string = value.substring(pos);
                    let b:string = value.substring(0,pos);

                    this.setElementValue(b + this.event.key + a);
                    this.setPosition(++pos);
                }
            }
        }

        return(true);
    }

    private xfixed() : boolean
    {
		if (this.type == "range")
			return(true);

		if (this.element.readOnly)
			return(true);

        let prevent:boolean = this.event.prevent;

        if (this.event.prevent)
            prevent = true;

        if (this.event.type == "drop")
            prevent = true;

        if (this.event.type == "keypress")
            prevent = true;

        if (this.event.key == "ArrowLeft" && this.event.shift)
            prevent = true;

        if (!this.event.modifier)
        {
            switch(this.event.key)
            {
                case "Backspace":
                case "ArrowLeft":
                case "ArrowRight": prevent = true;
            }
        }

        this.event.preventDefault(prevent);
        let pos:number = this.getPosition();

		// Get ready to markup
		if (this.event.mousedown && this.event.mouseinit)
			this.clearSelection();

		// Mark current pos for replace
		if (this.event.type == "click" && !this.event.mousemark)
		{
            let npos:number = this.pattern.findPosition(pos);
			this.setSelection([npos,npos]);

			setTimeout(() =>
			{
				// Sometimes setSelection can fail
				let sel:number[] = this.getSelection();
				if (sel[0] == sel[1]) this.setSelection([npos,npos]);
			},0);

			return(true);
		}

        if (this.event.type == "focus")
        {
            pos = this.pattern.findPosition(0);

			this.pattern.setValue(this.getIntermediateValue());
			this.setIntermediateValue(this.pattern.getValue());

            this.setPosition(pos);
            this.pattern.setPosition(pos);

            return(true);
        }

        if (this.event.type == "blur")
        {
			this.pattern.setValue(this.getIntermediateValue());
			if (this.pattern.isNull()) this.clear();
            return(true);
        }

        if (this.event.type == "change")
            return(true);

        if (this.event.type == "mouseout" && this.pattern.isNull() && !this.event.focus)
		{
			this.clear();
            return(true);
		}

		if (this.event.type.startsWith("mouse") || this.event.type == "wheel")
			return(true);

        let ignore:boolean = this.event.ignore;
        if (this.event.printable) ignore = false;

        if (this.event.repeat)
        {
            switch(this.event.key)
            {
                case "Backspace":
                case "ArrowLeft":
                case "ArrowRight": ignore = false;
            }
        }

        if (ignore) return(true);

        if (this.event.key == "Backspace" && !this.event.modifier)
        {
            let sel:number[] = this.getSelection();

            if (sel[0] == sel[1] && !this.pattern.input(sel[0]))
            {
                pos = this.pattern.prev(true);
                this.setSelection([pos,pos]);
            }
            else
            {
                pos = sel[0];

                if (sel[0] > 0 && sel[0] == sel[1])
                {
                    pos--;

                    // Move past fixed pattern before deleting
                    if (!this.pattern.setPosition(pos) && sel[0] > 0)
                    {
                        let pre:number = pos;

                        pos = this.pattern.prev(true);
                        let off:number = pre - pos;

                        if (off > 0)
                        {
                            sel[0] = sel[0] - off;
                            sel[1] = sel[1] - off;
                        }
                    }
                }

                pos = sel[0];
                this.setElementValue(this.pattern.delete(sel[0],sel[1]));

                if (sel[1] == sel[0] + 1)
                    pos = this.pattern.prev(true);

                if (!this.pattern.setPosition(pos))
                    pos = this.pattern.prev(true,pos);

                if (!this.pattern.setPosition(pos))
                    pos = this.pattern.next(true,pos);

                this.setSelection([pos,pos]);
            }

            return(true);
        }

		if (this.event.undo || this.event.paste)
		{
			setTimeout(() =>
			{
				this.pattern.setValue(this.getIntermediateValue());
				this.setValue(this.pattern.getValue());
                this.setPosition(this.pattern.next(true,pos));
			},0);
			return(true);
		}

        if (this.event.printable)
        {
            let sel:number[] = this.getSelection();

			if (this.datetokens != null && this.event.key == ' ' && this.pattern.isNull())
			{
				this.pattern.setValue(this.getCurrentDate());
				this.setElementValue(this.pattern.getValue());

				this.setPosition(0);
				this.pattern.setPosition(0);

				return(true);
			}

            if (sel[0] != sel[1])
            {
                pos = sel[0];

				if (!this.pattern.isValid(pos,this.event.key))
					return(true);

                this.pattern.delete(sel[0],sel[1]);
                this.setElementValue(this.pattern.getValue());
                pos = this.pattern.findPosition(sel[0]);
                this.setSelection([pos,pos]);
            }

            if (this.pattern.setCharacter(pos,this.event.key))
            {
				if (this.datetokens != null)
					this.validateDateField(pos);

				pos = this.pattern.next(true,pos);
                this.setElementValue(this.pattern.getValue());
                this.setSelection([pos,pos]);
            }

            return(true);
        }

        if (this.event.key == "ArrowLeft")
        {
            let sel:number[] = this.getSelection();

            if (!this.event.modifier)
            {
                pos = this.pattern.prev(true);
                this.setSelection([pos,pos]);
            }
            else if (this.event.shift)
            {
                if (pos > 0)
                {
                    pos--;
                    this.setSelection([pos,sel[1]-1]);
                }
            }
            return(false);
        }

        if (this.event.key == "ArrowRight")
        {
            let sel:number[] = this.getSelection();

            if (!this.event.modifier)
            {
                pos = this.pattern.next(true);
                this.setSelection([pos,pos]);
            }
            else if (this.event.shift)
            {
				pos = sel[1];

				if (pos < this.pattern.size())
                    this.setSelection([sel[0],pos]);
            }
            return(false);
        }

        return(true);
    }

	private getObject(value:string) : any
	{
		value = value.trim();

		if (value.length == 0)
			return(null);

		if (this.int)
			return(+value);

		if (this.dec)
			return(+value);

		if (this.pattern != null)
			return(this.pattern.getValue());

		return(value);
	}

	private validate(value:any) : boolean
	{
		value += "";

		if (value.trim().length == 0)
			return(true);

		if (this.dec && isNaN(+value))
			return(false);

		if (this.int)
		{
			if (isNaN(+value) || value.includes(".") || value.includes("."))
				return(false);
		}

		if (this.pattern != null)
		{
			let valid:boolean = this.pattern.setValue(value);
			this.setElementValue(this.pattern.getValue());
			return(valid);
		}

		return(true);
	}

	private validateDateField(pos:number) : void
	{
		let section:Section = this.pattern.findField(pos);
		let token:FormatToken = this.datetokens[section.field()];

		let maxval:number = 0;
		let value:string = section.getValue();

		switch(token.type)
		{
			case DatePart.Day 		: maxval = 31; break;
			case DatePart.Month 	: maxval = 12; break;
			case DatePart.Hour 		: maxval = 23; break;
			case DatePart.Minute 	: maxval = 59; break;
			case DatePart.Second 	: maxval = 59; break;
		}

		if (maxval > 0 && +value > maxval)
			section.setValue(""+maxval);


		let finished:boolean = true;
		this.pattern.getFields().forEach((section) =>
		{
			value = section.getValue();

			if (value.trim().length > 0)
			{
				let lpad:string = "";

				for (let i = 0; i < value.length; i++)
				{
					if (value.charAt(i) != ' ') break;
					else lpad += "0";
				}

				if (lpad.length > 0)
					section.setValue(lpad+value.substring(lpad.length));
			}

			if (section.getValue().includes(' '))
				finished = false;
		});

		if (finished)
		{
			let dayentry:number = -1;

			for (let i = 0; i < this.datetokens.length; i++)
			{
				if (this.datetokens[i].type == DatePart.Day)
					dayentry = i;
			}

			if (dayentry >= 0)
			{
				let tries:number = 3;
				value = this.pattern.getValue();

				while(dates.parse(this.pattern.getValue()) == null && --tries >= 0)
				{
					let day:number = +this.pattern.getField(dayentry).getValue();
					this.pattern.getField(dayentry).setValue(""+(day-1));
				}

				if (tries < 3)
					Alert.message("Date '"+value+"' is invalid, changed to "+this.pattern.getValue(),"Date Validation");
			}
		}
	}

	private getCurrentDate() : string
	{
		return(dates.format(new Date()));
	}

    private getPosition() : number
    {
        let pos:number = this.element.selectionStart;

        if (pos < 0)
        {
            pos = 0;
            this.setSelection([pos,pos]);
        }

        return(pos);
    }

    private setPosition(pos:number) : void
    {
        if (pos < 0) pos = 0;
		let sel:number[] = [pos,pos];

		if (pos == 0) sel[1] = 1;
        this.element.setSelectionRange(sel[0],sel[1]);
    }

    private setSelection(sel:number[]) : void
    {
        if (sel[0] < 0) sel[0] = 0;
        if (sel[1] < sel[0]) sel[1] = sel[0];

		this.element.selectionStart = sel[0];
		this.element.selectionEnd = sel[1]+1;
    }

    private clearSelection() : void
    {
		this.element.setSelectionRange(0,0);
    }

    private getSelection() : number[]
    {
        let pos:number[] = [];
        pos[1] = this.element.selectionEnd;
        pos[0] = this.element.selectionStart;
        return(pos);
    }

	private getElementValue() : string
	{
		return(this.element.value);
	}

	private setElementValue(value:string) : void
	{
		if (value == null) value = "";
		this.element.value = value;
	}

	private get disabled() : boolean
	{
		return(this.element.disabled);
	}

	private clear() : void
	{
		this.element.value = "";
	}

    private addEvents(element:HTMLElement) : void
    {
        element.addEventListener("blur",this);
        element.addEventListener("focus",this);
        element.addEventListener("change",this);

        element.addEventListener("keyup",this);
        element.addEventListener("keydown",this);
        element.addEventListener("keypress",this);

        element.addEventListener("wheel",this);
        element.addEventListener("mouseup",this);
        element.addEventListener("mouseout",this);
        element.addEventListener("mousedown",this);
        element.addEventListener("mouseover",this);
        element.addEventListener("mousemove",this);

        element.addEventListener("drop",this);
        element.addEventListener("dragover",this);

        element.addEventListener("click",this);
        element.addEventListener("dblclick",this);
    }
}