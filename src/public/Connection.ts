/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { FlightRecorder } from "../application/FlightRecorder.js";

/**
 * Basic HTTP connection to backend.
 * This class is meant for extending and does not implement any username/password security.
 */
export class Connection
{
	private base$:URL = null;
	private headers$:any = {};
	private method$:string = null;
	private authmeth$:string = null;
	private success$:boolean = true;

	/**
	* Create connection. If no url specified, the Origin of the page is used 
	*
	*
	* @param url constructer url string or url
	*/

	public constructor(url?:string|URL)
	{
		if (url == null)
			url = window.location.origin;

		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}



	/** 
	* 
	* The base url for this connection 
	* 
	*  @return the baseurl of url
   */

	public get baseURL() : URL
	{
		return(this.base$);
	}

	/**
	* The authorization method. Not used in the base class.
	*
	*
	* @returns The authorization method as a string.
	*/

	public get authmethod() : string
	{
		return(this.authmeth$);
	}

	/** The authorization method. Not used in base class 
	* 
	* @param method - The authorization method to set.
	*/
	public set authmethod(method:string)
	{
		this.authmeth$ = method;
	}

	/** Whether the last request was successfull 
	*
	*  @returns A boolean indicating the success status of the last request.
	*/
	public get success() : boolean
	{
		return(this.success$);
	}

	/** Get the request headers 
	* 
	* 
	*@returns The request headers.
	*/
	public get headers() : any
	{
		return(this.headers$);
	}

	/** Set the request headers 
	* 
	* 
   * @param headers - The request headers to set.
	*/
	public set headers(headers:any)
	{
		this.headers$ = headers;
	}

	/** Set the base url 
	* 
	* 
	* @param url - The base URL to set. Accepts either a string or a URL object. 
	*/
	public set baseURL(url:string|URL)
	{
		if (typeof url === "string")
			url = new URL(url);

		this.base$ = url;
	}

	/** Not used in base class 
	* 
	* 
   * @returns Always false, as not used in the base class.
	*/
	public get transactional() : boolean
	{
		return(false);
	}

	/** Perform HTTP GET 
	* 
	* 
	* @param url - The URL for the GET request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the GET request. 
	*/
	public async get(url?:string|URL, raw?:boolean) : Promise<any>
	{
		this.method$ = "GET";
		return(this.invoke(url,null,raw));
	}

	/** Perform HTTP POST 
	* 
	* @param url - The URL for the POST request. Optional.
   * @param payload - The payload for the POST request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the POST request. 
	*/
	public async post(url?:string|URL, payload?:string|any, raw?:boolean) : Promise<any>
	{
		this.method$ = "POST";
		return(this.invoke(url,payload,raw));
	}

	/** Perform HTTP PATCH 
	* 
	* @param url - The URL for the PATCH request. Optional.
   * @param payload - The payload for the PATCH request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the PATCH request.
	*/
	public async patch(url?:string|URL, payload?:string|any, raw?:boolean) : Promise<any>
	{
		this.method$ = "PATCH";
		return(this.invoke(url,payload,raw));
	}

	/**
   * Invokes an HTTP request.
   *
   * @param url - The URL for the request.
   * @param payload - The payload for the request.
   * @param raw - Indicates whether to return the raw response.
   * @returns A promise that resolves to the response of the HTTP request.
   * @private
   */
	private async invoke(url:string|URL, payload:string|any, raw:boolean) : Promise<any>
	{
		let body:any = null;
		this.success$ = true;

		let endpoint:URL = new URL(this.base$);
		if (url) endpoint = new URL(url,endpoint);

		if (payload)
		{
			if (typeof payload != "string")
				payload = JSON.stringify(payload);
		}

		if (!endpoint.toString().endsWith("ping"))
			FlightRecorder.add("@connection: "+endpoint+(payload ? " "+JSON.stringify(payload) : ""))

		let http:any = await fetch(endpoint,
		{
			method 	: this.method$,
			headers 	: this.headers$,
			body 		: payload
		}).
		catch((errmsg) =>
		{
			if (raw) body = errmsg;
			else body =
			{
				success: false,
				message: errmsg
			};

			this.success$ = false;
		});

		if (this.success$)
		{
			if (raw) body = await http.text();
			else		body = await http.json();
		}

		return(body);
	}
}