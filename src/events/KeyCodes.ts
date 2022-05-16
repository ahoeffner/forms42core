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

export class KeyCodes
{
    static Backspace    : number =  8;
    static Tab          : number =  9;
    static Enter        : number = 13;
    static Escape       : number = 27;
    static PageUp       : number = 33;
    static PageDown     : number = 34;
    static End          : number = 35;
    static Home         : number = 36;
    static ArrowUp      : number = 38;
    static ArrowDown    : number = 40;
    static ArrowLeft    : number = 37;
    static ArrowRight   : number = 39;
    static Insert       : number = 45;
    static Delete       : number = 46;
    static f1           : number = 112;
    static f2           : number = 113;
    static f3           : number = 114;
    static f4           : number = 115;
    static f5           : number = 116;
    static f6           : number = 117;
    static f7           : number = 118;
    static f8           : number = 119;
    static f9           : number = 120;
    static f10          : number = 121;
    static f11          : number = 122;
    static f12          : number = 123;

	static code(char:string) : number
	{
		if (char == null) return(null);
		console.log("KeyCodes: "+char.toLowerCase());
		let numval:number = KeyCodes[char.toLowerCase()];

		if (numval) return(numval);
		else return(char.charCodeAt(0));
	}
}