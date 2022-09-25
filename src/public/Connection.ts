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

export class Connection
{
	private base$:URL = null;
	private name$:string = null;
	private success$:boolean = true;

	private headers$:any =
	{
		"Accept" : "application/json",
		"Content-Type": "application/json"
	};

	public constructor(name:string, url?:string|URL)
	{
		this.name$ = name;

		let host:string = window.location.host;
		let prot:string = window.location.protocol;

		if (url == null)
			url = prot+'//'+host;

		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get success() : boolean
	{
		return(this.success$);
	}

	public get baseURL() : URL
	{
		return(this.base$);
	}

	public get headers() : any
	{
		return(this.headers$);
	}

	public set headers(headers:any)
	{
		this.headers$ = headers;
	}

	public set baseURL(url:string|URL)
	{
		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}

	public async invoke(url?:string|URL, payload?:any) : Promise<any>
	{
		let body:any = null;
		this.success$ = true;

		let endpoint:URL = new URL(this.base$);
		if (url) endpoint = new URL(url,endpoint);

		let http:any = await fetch(endpoint,
		{
			method : 'POST',
			headers : this.headers$,
			body : JSON.stringify(payload)
		}).
		catch((err) =>
		{
			body = err;
			this.success$ = false;
		});

		if (this.success$)
			body = await http.json();

		return(body);
	}
}