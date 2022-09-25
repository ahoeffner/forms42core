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

	public constructor(url?:string|URL)
	{
		let host:string = window.location.host;
		let prot:string = window.location.protocol;

		if (url == null)
			url = prot+'//'+host;

		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}

	public get baseURL() : URL
	{
		return(this.base$);
	}

	public set baseURL(url:string|URL)
	{
		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}

	public async invoke(url?:string|URL,payload?:any) : Promise<any>
	{
		let endpoint:URL = new URL(this.base$);
		if (url) endpoint = new URL(url,endpoint);

		await fetch(endpoint,
		{
			method: 'POST',
			mode: 'no-cors'
		})
		.then(function(response) {console.log(response)});

		return(null);
	}
}