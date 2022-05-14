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

import { Class } from "../types/Class.js";
import { KeyDefaults } from "./KeyDefaults.js";

export class KeyMap
{
	public static set(map:Class<any>) : void
	{
		KeyMapping.clear();
		KeyMap.merge(map);
	}

	public static merge(map:Class<any>) : void
	{
		Object.keys(map).forEach((mapped) =>
		{
			if ((map[mapped] instanceof KeyMap))
				KeyMapping.add(map[mapped]);
		});
	}

	private key$:number;
	private alt$:boolean;
	private ctrl$:boolean;
	private meta$:boolean;
	private shift$:boolean;

	private signature$:string = null;

	constructor(def:KeyDefinition)
	{
		this.key$ = def.key;

		this.alt$ = (def.alt ? true : false);
		this.ctrl$ = (def.ctrl ? true : false);
		this.meta$ = (def.meta ? true : false);
		this.shift$ = (def.shift ? true : false);

		this.signature$ = ""+this.key$ + "|";

		this.signature$ += (this.alt$   ? 't' : 'f');
		this.signature$ += (this.ctrl$  ? 't' : 'f');
		this.signature$ += (this.meta$  ? 't' : 'f');
		this.signature$ += (this.shift$ ? 't' : 'f');
	}

	public get key() : number
	{
		return(this.key$);
	}

	public get alt() : boolean
	{
		return(this.alt$);
	}

	public get ctrl() : boolean
	{
		return(this.ctrl$);
	}

	public get meta() : boolean
	{
		return(this.meta$);
	}

	public get shift() : boolean
	{
		return(this.shift$);
	}

	public get signature() : string
	{
		return(this.signature$);
	}
}

export interface KeyDefinition
{
	key:number;
	alt?:boolean;
	ctrl?:boolean;
	meta?:boolean;
	shift?:boolean;
}

export class KeyMapping
{
	private static map:Map<string,KeyMap> = KeyMapping.init();

	private static init() : Map<string,KeyMap>
	{
		KeyMapping.map = new Map<string,KeyMap>();
		KeyMap.merge(KeyDefaults);
		return(KeyMapping.map);
	}

	public static clear() : void
	{
		KeyMapping.map.clear();
	}

	public static add(keymap:KeyMap) : void
	{
		if (keymap != null)
			KeyMapping.map.set(keymap.signature,keymap);
	}

	public static get(signature:string, validated?:boolean) : KeyMap
	{
		if (!validated)
			signature = KeyMapping.complete(signature);

		let key:KeyMap = KeyMapping.map.get(signature);

		if (key == null) key = KeyMapping.create(signature);
		return(key);
	}

	private static complete(signature:string) : string
	{
		let pos:number = signature.indexOf('|');

		if (pos <= 0)
		{
			signature += "|";
			pos = signature.length - 1;
		}

		while(signature.length - pos < 5)
			signature += 'f';

		return(signature);
	}

	private static create(signature:string) : KeyMap
	{
		let pos:number = signature.indexOf('|');
		let key:string = signature.substring(0,pos);

		if (isNaN(+key))
			throw "@KeyMapping: invalid key signature. key is not a number";

		let a:string = signature.substring(pos,pos+1);
		let c:string = signature.substring(pos,pos+2);
		let m:string = signature.substring(pos,pos+3);
		let s:string = signature.substring(pos,pos+4);

		let def:KeyDefinition =
		{
			key: +key,
			alt: (a == 't' ? true : false),
			ctrl: (c == 't' ? true : false),
			meta: (m == 't' ? true : false),
			shift: (s == 't' ? true : false),
		};

		let keymap:KeyMap = new KeyMap(def);
		KeyMapping.map.set(keymap.signature,keymap);

		return(keymap);
	}
}