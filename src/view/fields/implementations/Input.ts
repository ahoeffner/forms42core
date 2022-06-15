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

import { Common } from "./Common.js";
import { Pattern } from "../Pattern.js";
import { BrowserEvent } from "../../BrowserEvent.js";
import { FieldContainer } from "../interfaces/FieldContainer.js";
import { FieldImplementation } from "../interfaces/FieldImplementation.js";
import { HTMLProperties } from "../HTMLProperties.js";


export class Input extends Common implements FieldImplementation, EventListenerObject
{
	private before:string = "";
    private int:boolean = false;
    private dec:boolean = false;
	private pattern:Pattern = null;
	private fixedval:string = null;
    private placeholder:string = null;
	private container:FieldContainer = null;

	private element:HTMLInputElement = null;
    private event:BrowserEvent = new BrowserEvent();

	constructor()
	{
		super();
	}

	public create(container:FieldContainer) : HTMLInputElement
	{
		this.element = document.createElement("input");

		this.container = container;
		super.setImplementation(this);

		return(this.element);
	}

	public apply(properties:HTMLProperties) : void
	{
		this.addEvents(this.element);
		this.setClasses(properties.getClasses());
		this.setAttributes(properties.getAttributes());

	}

    public getValue() : any
    {
        let str:string = this.element.value.trim();
        if (str.length == 0) return(null);
        return(str);
    }

    public setValue(value:any) : boolean
    {
		let ok:boolean = false;
        if (value == null) value = "";

		if (typeof value === "string")
		{
			ok = true;
			this.element.value = value;
		}

		if (!ok)
			throw "@Input: Not implemented";

		ok = this.validateInput(value);
		this.before = this.element.value;

		return(ok);
    }

	private clear() : void
	{
		this.element.value = "";
	}

	// Get unvalidated
	public override getStringValue(): string
	{
		let value:string = this.element.value;
		if (this.pattern == null) value = value.trim();
		return(value);
	}

	// Set unvalidated
	public override setStringValue(value:string) : void
	{
        if (value == null)
			value = "";

		value = value.trim();

		if (this.pattern != null && value.length > 0)
		{
			this.pattern.setValue(value);
			value = this.pattern.getValue();
		}

		this.invalid(false);
		this.before = value;
		this.element.value = value;
	}

	public getElement() : HTMLElement
	{
		return(this.element);
	}

    public setAttributes(attributes:Map<string,any>) : void
    {
        let pattern:string = null;
        let type:string = this.container.properties.subtype;

        attributes.forEach((value,attr) =>
        {
			this.element.setAttribute(attr,value);
            if (attr == "x-pattern") pattern = value;
            if (attr == "x-placeholder") this.placeholder = value;
        });

        if (type == "x-int")
            this.int = true;

        if (type == "x-dec")
            this.dec = true;

        if (type == "x-date")
            this.pattern = new Pattern("{##} - {##} - {####}");

        if (type == "x-fixed")
        {
            if (pattern == null)
                console.error("x-pattern not specified for x-fixed field");

            this.pattern = new Pattern(pattern);
        }

		if (type.startsWith("x-"))
			type = "text";

        this.element.setAttribute("type",type);
    }

    public handleEvent(event:Event) : void
    {
        let buble:boolean = false;
        this.event.setEvent(event);
		this.event.modified = false;
        let pos:number = this.getPosition();

        if (this.pattern != null)
        {
            if (!this.xfixed())
                return;
        }

        if (this.event.type == "blur")
        {
			buble = true;

			if (this.pattern != null)
			{
				// Fixed doesn't fire change
				if (this.getStringValue() != this.fixedval)
				{
					this.event.type = "change";
					this.container.handleEvent(this.event);
					this.event.type = "blur";
				}
			}

            if (this.placeholder != null)
				this.removeAttribute("placeholder");
        }

        if (this.event.type == "focus")
        {
			buble = true;
			if (this.placeholder != null)
                this.setAttribute("placeholder",this.placeholder);
        }

        if (this.event.mouseinit)
                this.clearSelection(pos);

        if (this.event.type == "mouseover" && this.placeholder != null)
            this.setAttribute("placeholder",this.placeholder);

        if (this.event.type == "mouseout" && this.placeholder != null && !this.event.focus)
            this.removeAttribute("placeholder");

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

		if (this.event.navigation) buble = true;
		else if (this.event.ignore) return;

		if (event.type == "change")
		{
			buble = true;

			if (this.pattern != null)
				this.fixedval = this.getStringValue();
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

		let after:string = this.getStringValue();

		if (this.before != after)
		{
			buble = true;
			this.before = after;
			this.invalid(false);
			this.event.modified = true;
		}

		if (this.event.mark)
			buble = false;

        if (buble)
			this.container.handleEvent(this.event);
    }

    private xint() : boolean
    {
        let pos:number = this.getPosition();

        if (this.event.type == "keydown")
        {
            if (this.event.isPrintableKey)
            {
                if (this.event.key < '0' || this.event.key > '9')
                {
                    this.event.preventDefault(true);
                }
                else if (this.event.repeat)
                {
                    let value:string = this.element.value;

                    let a:string = value.substring(pos);
                    let b:string = value.substring(0,pos);

                    this.setElementValue(b + this.event.key + a);
                    this.setPosition(++pos);
                }
            }

			if (this.event.ctrlkey == null && this.event.funckey == null)
				return(false);
        }

		if (this.event.type == "blur" || this.event.type == "change")
			this.validateInput(this.getStringValue());

        return(true);
    }

    private xdec() : boolean
    {
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

            return(false);
        }

		if (this.event.type == "blur" || this.event.type == "change")
			this.validateInput(this.getStringValue());

        return(true);
    }

    private xfixed() : boolean
    {
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

        if (this.event.type == "focus")
        {
            pos = this.pattern.findPosition(0);

			this.pattern.setValue(this.getStringValue());
			this.setStringValue(this.pattern.getValue());

            this.setPosition(pos);
            this.pattern.setPosition(pos);
			this.fixedval = this.getStringValue();

            return(true);
        }

        if (this.event.type == "blur")
        {
			this.pattern.setValue(this.getStringValue());
			if (this.pattern.isNull()) this.clear();
            return(true);
        }

        if (this.event.type == "change")
        {
			this.validateInput(this.getStringValue());
            return(true);
        }

		if (this.element.readOnly)
			return(true);

        if (this.event.type == "mouseout" && this.pattern.isNull() && !this.event.focus)
			this.clear();

        if (this.event.type == "mouseup")
        {
            // Wait until position is set

            let sel:number[] = this.getSelection();

            if (sel[0] > this.pattern.size() - 1)
                sel[0] = this.pattern.size() - 1;

            if (sel[1] > this.pattern.size() - 1)
                sel[1] = this.pattern.size() - 1;

            if (sel[1] < sel[0]) sel[1] = sel[0];

            if (!this.event.mousemark)
            {
                setTimeout(() =>
                {
                    pos = this.getPosition();

                    if (pos >= this.pattern.size())
                        pos = this.pattern.size() - 1;

                    pos = this.pattern.findPosition(pos);
                    let fld:number[] = this.pattern.getFieldArea(pos);

                    // toggle field selection
                    if (sel[1] - sel[0] < 1) pos = fld[0];
                    else                     fld = [pos,pos];

                    this.setSelection(fld);
                    this.pattern.setPosition(this.pattern.findPosition(pos));
                },1);
            }
            else
            {
                setTimeout(() =>
                {
                    pos = this.getPosition();

                    if (pos >= this.pattern.size())
                        pos = this.pattern.size() - 1;

                    if (!this.pattern.setPosition(pos))
                        pos = this.pattern.findPosition(pos);

                    sel[1] = sel[1] - 1;
                    if (sel[1] < sel[0]) sel[1] = sel[0];

                    this.setSelection(sel);
                    this.pattern.setPosition(pos);
                },1);
            }

            return(false);
        }

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
				this.pattern.setValue(this.getStringValue());
				this.setValue(this.pattern.getValue());
                this.setPosition(this.pattern.next(true,pos));
			},0);
			return(true);
		}

        if (this.event.printable)
        {
            let sel:number[] = this.getSelection();

            if (sel[0] != sel[1])
            {
                pos = sel[0];
                this.pattern.delete(sel[0],sel[1]);
                this.setElementValue(this.pattern.getValue());
                pos = this.pattern.findPosition(sel[0]);
                this.setSelection([pos,pos]);
            }

            if (this.pattern.setCharacter(pos,this.event.key))
            {
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

	private validateInput(val:string) : boolean
	{
		if (val.trim().length == 0)
			return(true);

		if (this.dec)
		{
			if (isNaN(+val))
			{
				this.setElementValue(null);
				return(false);
			}
		}

		if (this.int)
		{
			if (isNaN(+val) || val.includes(".") || val.includes("."))
			{
				this.setElementValue(null);
				return(false);
			}
		}

		if (this.pattern != null)
		{
			let valid:boolean = this.pattern.setValue(val);
			this.setElementValue(this.pattern.getValue());
			return(valid);
		}

		return(true);
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

    private clearSelection(pos:number) : void
    {
        this.setPosition(pos);
    }

    private getSelection() : number[]
    {
        let pos:number[] = [];
        pos[1] = this.element.selectionEnd;
        pos[0] = this.element.selectionStart;
        return(pos);
    }

	private setElementValue(value:string) : void
	{
		this.element.value = value;
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