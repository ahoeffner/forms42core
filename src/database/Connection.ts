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

import { Cursor } from "./Cursor.js";
import { BindValue } from "./BindValue.js";
import { Batch } from "./serializable/Batch.js";
import { Query } from "./serializable/Query.js";
import { MSGGRP } from "../messages/Internal.js";
import { Script } from "./serializable/Script.js";
import { Update } from "./serializable/Update.js";
import { Insert } from "./serializable/Insert.js";
import { Delete } from "./serializable/Delete.js";
import { ConnectionScope } from "./ConnectionScope.js";
import { Logger, Type } from "../application/Logger.js";
import { Messages, Level } from "../messages/Messages.js";
import { EventType } from "../control/events/EventType.js";
import { FormsModule } from "../application/FormsModule.js";
import { FormBacking } from "../application/FormBacking.js";
import { Serializable } from "./serializable/Serializable.js";
import { Session, SessionRequest } from "./serializable/Session.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
import { Connection as BaseConnection } from "../public/Connection.js";
import { FormEvent, FormEvents } from "../control/events/FormEvents.js";


export class Connection extends BaseConnection
{
	private locks$:number = 0;
	private trx$:object = null;
	private conn$:string = null;
	private touched$:Date = null;
	private modified$:Date = null;
	private keepalive$:number = 20;
	private running$:boolean = false;
	private tmowarn$:boolean = false;
	private authmethod$:string = null;
	private autocommit$:boolean = false;
	private attributes$:Map<string,any> = new Map<string,any>();
	private clientinfo$:Map<string,any> = new Map<string,any>();
	private scope$:ConnectionScope = ConnectionScope.transactional;

	public static MAXLOCKS:number = 32;
	public static TRXTIMEOUT:number = 240;
	public static LOCKINSPECT:number = 120;
	public static CONNTIMEOUT:number = 120;


	// Be able to get the real connection from the public
	private static conns$:Map<DatabaseConnection,Connection> =
		new Map<DatabaseConnection,Connection>();


	public static getConnection(pubconn:DatabaseConnection) : Connection
	{
		return(Connection.conns$.get(pubconn));
	}


	public static getAllConnections() : Connection[]
	{
		return([...Connection.conns$.values()]);
	}

	public constructor(url:string|URL, pubconn:DatabaseConnection)
	{
		super(url);
		Connection.conns$.set(pubconn,this);
	}

	public get locks() : number
	{
		return(this.locks$);
	}

	public set locks(locks:number)
	{
		let trxstart:boolean =
			this.modified == null && this.transactional;

		if (this.autocommit$)
			return;

		if (!this.modified)
			this.modified = new Date();

		this.locks$ = locks;

		if (trxstart)
			FormEvents.raise(FormEvent.AppEvent(EventType.OnTransaction));
	}

	public get scope() : ConnectionScope
	{
		return(this.scope$);
	}

	public set scope(scope:ConnectionScope)
	{
		if (this.connected())
		{
			// Connection scope cannot be changed after connect
			Messages.warn(MSGGRP.JWDB,1)
			return;
		}
		this.scope$ = scope;
	}

	public get authmethod() : string
	{
		return(this.authmethod$);
	}

	public set authmethod(method:string)
	{
		this.authmethod$ = method;
	}

	public get transactional() : boolean
	{
		return(this.scope != ConnectionScope.stateless);
	}

	public addAttribute(name:string, value:any) : void
	{
		this.attributes$.set(name,value);
	}

	public deleteAttribute(name:string) : void
	{
		this.attributes$.delete(name);
	}

	public addClientInfo(name:string, value:any) : void
	{
		this.clientinfo$.set(name,value);
	}

	public deleteClientInfo(name:string) : void
	{
		this.clientinfo$.delete(name);
	}

	public connected() : boolean
	{
		return(this.conn$ != null);
	}

	public hasTransactions() : boolean
	{
		return(this.modified != null);
	}

	public hasKeepAlive() : boolean
	{
		return(this.running$);
	}

	public async connect(username?:string, password?:string, custom?:Map<string,any>) : Promise<boolean>
	{
		this.touched = null;
		this.tmowarn = false;

		let scope:string = null;

		switch(this.scope)
		{
			case ConnectionScope.stateless: scope = "stateless"; break;
			case ConnectionScope.dedicated: scope = "dedicated"; break;
			case ConnectionScope.transactional: scope = "transaction"; break;
		}

		let method:string = this.authmethod$;
		if (!method) method = "database";

		let session:Session = new Session(SessionRequest.connect);

		session.scope = scope;
		session.method = method;

		if (username)
			session.username = username;

		if (password)
			session.password = password;

		let cust:any = null;

		if (custom || this.attributes$.size > 0)
			cust = {};

		if (custom)
		{
			custom.forEach((value,name) =>
			  {cust[name] = value})
		}

		this.attributes$.forEach((value,name) =>
			{cust[name] = value})

		if (cust)
			session.custom = cust;

		if (this.clientinfo$.size > 0)
		{
			let info:{name:string, value:any}[] = [];
			this.clientinfo$.forEach((value,name) => info.push({name: name, value: value}));
			session.clientinfo = info;
		}

		Logger.log(Type.database,"connect");

		let thread:number = FormsModule.showLoading("Connecting");
		let response:any = await this.send(session);
		FormsModule.hideLoading(thread);

		if (!response.success)
		{
			Messages.handle(MSGGRP.JWDB,response.message,Level.fine);
			return(false);
		}

		this.trx$ = new Object();
		this.conn$ = response.session;
		this.autocommit$ = response.autocommit;
		this.keepalive$ = (+response.timeout * 4/5)*1000;

		if (this.keepalive$ > 4/5*Connection.LOCKINSPECT*1000)
			this.keepalive$ = 4/5*Connection.LOCKINSPECT*1000;

		await FormEvents.raise(FormEvent.AppEvent(EventType.Connect));

		if (!this.running$)
			this.keepalive();

		return(true);
	}

	public async disconnect() : Promise<boolean>
	{
		this.tmowarn = false;
		this.trx = new Object();
		this.touched = new Date();

		let cust:any = (this.attributes$.size > 0) ? {} : null;
		let session:Session = new Session(SessionRequest.disconnect);

		this.attributes$.forEach((value,name) =>
			{cust[name] = value})

		if (cust)
			session.custom = cust;

		Logger.log(Type.database,"disconnect");
		let response:any = await this.send(session);

		if (response.success)
		{
			this.conn$ = null;
			this.touched = null;
			this.modified = null;
		}

		await FormEvents.raise(FormEvent.AppEvent(EventType.Disconnect));
		return(response.success);
	}

	public async commit() : Promise<boolean>
	{
		if (this.modified == null)
			return(true);

		this.tmowarn = false;
		this.trx = new Object();
		this.touched = new Date();

		let cust:any = (this.attributes$.size > 0) ? {} : null;
		let session:Session = new Session(SessionRequest.commit);

		this.attributes$.forEach((value,name) =>
			{cust[name] = value})

		if (cust)
			session.custom = cust;

		Logger.log(Type.database,"commit");
		let thread:number = FormsModule.showLoading("Comitting");
		let response:any = await this.send(session);
		FormsModule.hideLoading(thread);

		if (response.success)
		{
			this.locks$ = 0;
			this.touched = null;
			this.modified = null;

			if (response["session"])
				this.conn$ = response.session;
		}

		if (!response.success)
		{
			Messages.handle(MSGGRP.TRX,response.message,Level.fine);
			return(false);
		}

		return(true);
	}

	public async rollback() : Promise<boolean>
	{
		if (!this.modified)
			return(true);

		this.tmowarn = false;

		let cust:any = (this.attributes$.size > 0) ? {} : null;
		let session:Session = new Session(SessionRequest.rollback);

		this.attributes$.forEach((value,name) =>
			{cust[name] = value})

		if (cust)
			session.custom = cust;

		Logger.log(Type.database,"rollback");
		let thread:number = FormsModule.showLoading("Rolling back");
		let response:any = await this.send(session);
		FormsModule.hideLoading(thread);

		if (response.success)
		{
			this.locks$ = 0;
			this.touched = null;
			this.modified = null;
			this.trx = new Object();

			if (response["session"])
				this.conn$ = response.session;
		}

		if (!response.success)
		{
			Messages.handle(MSGGRP.TRX,response.message,Level.fine);
			return(false);
		}

		return(true);
	}

	public async release() : Promise<boolean>
	{
		this.tmowarn = false;

		let cust:any = (this.attributes$.size > 0) ? {} : null;
		let session:Session = new Session(SessionRequest.release);

		this.attributes$.forEach((value,name) =>
			{cust[name] = value})

		if (cust)
			session.custom = cust;

		Logger.log(Type.database,"release");
		let thread:number = FormsModule.showLoading("Releasing connection");
		let response:any = await this.send(session);
		FormsModule.hideLoading(thread);

		if (response.success)
		{
			this.locks$ = 0;
			this.touched = null;
			this.modified = null;
			this.trx = new Object();
		}

		if (!response.success)
		{
			Messages.handle(MSGGRP.TRX,response.message,Level.fine);
			return(false);
		}

		return(true);
	}

	public async send(request:Serializable) : Promise<Response>
	{
		let mod:Date = this.modified;

		if (!(request instanceof Session))
		{
			if (!this.conn$)
			{
				Messages.warn(MSGGRP.JWDB,3);
				return(null);
			}
		}

		if (request instanceof Query)
		{
			this.tmowarn = false;
			this.touched = new Date();
			if (request.lock)	this.modified = new Date();
		}

		if (request instanceof Insert)
		{
			this.tmowarn = false;
			this.touched = new Date();
			this.modified = new Date();
		}

		if (request instanceof Update)
		{
			this.tmowarn = false;
			this.touched = new Date();
			this.modified = new Date();
		}

		if (request instanceof Delete)
		{
			this.tmowarn = false;
			this.touched = new Date();
			this.modified = new Date();
		}

		if (request instanceof Batch && request.modyfies)
		{
			this.tmowarn = false;
			this.touched = new Date();
			this.modified = new Date();
		}

		if (request instanceof Script && request.modyfies)
		{
			this.tmowarn = false;
			this.touched = new Date();
			this.modified = new Date();
		}

		if (this.modified)
			this.modified = new Date();

		let payload:any = request.serialize();

		payload.compact = true;
		payload.dateformat = "UTC";
		if (this.conn$) payload.session = this.conn$;

		let thread:number = FormsModule.showLoading("Execute "+payload.request);
		let response:any = await this.post("/",payload);
		FormsModule.hideLoading(thread);

		if (this.modified && !mod)
			await FormEvents.raise(FormEvent.AppEvent(EventType.OnTransaction));

		if (!response.success)
		{
			let level:Level = Level.info;
			if (response.fatal) level = Level.warn;
			Messages.handle(MSGGRP.SQL,response.message,level);
			return(response);
		}

		if (response["session"])
			this.conn$ = response.session;

		return(response);

	}

	public setModified() : void
	{
		this.tmowarn = false;
		this.touched = new Date();
		this.modified = new Date();
	}

	public restore(cursor:Cursor) : boolean
	{
		if (cursor.trx != this.trx$)
			return(true);

		if (this.scope == ConnectionScope.stateless)
			return(true);

		return(false);
	}

	public get trx() : object
	{
		return(this.trx$);
	}

	private set trx(trx:object)
	{
		this.trx$ = trx;
	}

	private get tmowarn() : boolean
	{
		return(this.tmowarn$);
	}

	private set tmowarn(flag:boolean)
	{
		this.tmowarn$ = flag;
	}

	private get touched() : Date
	{
		return(this.touched$);
	}

	private set touched(date:Date)
	{
		this.touched$ = date;
	}

	private get modified() : Date
	{
		return(this.modified$);
	}

	private set modified(date:Date)
	{
		this.modified$ = date;
	}

	private async keepalive() : Promise<void>
	{
		this.running$ = true;
		await FormsModule.sleep(this.keepalive$);

		if (this.touched$)
		{
			let now:number = (new Date()).getTime();
			let next:number = this.touched$.getTime() + this.keepalive$;

			let nap:number = next - now;
			if (nap > 1000) await FormsModule.sleep(nap);
		}

		if (!this.connected())
		{
			this.running$ = false;
			return;
		}

		let conn:string = this.conn$;
		let request:Session = new Session(SessionRequest.keepalive);

		let response:any = await this.send(request);

		if (this.conn$ != conn)
		{
			this.touched = null;
			this.modified = null;
			this.tmowarn = false;
			this.keepalive();
			return;
		}

		if (!response.success)
		{
			this.conn$ = null;
			Messages.handle(MSGGRP.JWDB,response.message,Level.warn);
			await FormEvents.raise(FormEvent.AppEvent(EventType.Disconnect));
			this.running$ = false;
			return(response);
		}

		if (response["session"])
			this.conn$ = response.session;

		let idle:number = 0;

		if (this.modified)
			idle = ((new Date()).getTime() - this.modified.getTime())/1000;

		if (this.scope != ConnectionScope.stateless)
		{
			if (this.locks >= Connection.MAXLOCKS)
			{
				if (!this.tmowarn$)
				{
					this.tmowarn = true;
					Messages.warn(MSGGRP.TRX,6,Connection.TRXTIMEOUT); // Maximum number of locks reached
				}
				else
				{
					Messages.warn(MSGGRP.TRX,7); // Transaction is being rolled back
					await FormBacking.rollback();
				}
			}
		}

		if (this.scope == ConnectionScope.transactional)
		{
			if (this.modified)
			{
				if (idle > Connection.TRXTIMEOUT && this.tmowarn)
				{
					Messages.warn(MSGGRP.TRX,7); // Transaction is being rolled back
					await FormBacking.rollback();
				}
				else
				{
					if (idle > Connection.TRXTIMEOUT*2/3 && !this.tmowarn)
					{
						this.tmowarn = true;
						Messages.warn(MSGGRP.TRX,8,Connection.TRXTIMEOUT); // Transaction will be rolled back
					}
				}
			}

			else

			if (this.touched)
			{
				idle = ((new Date()).getTime() - this.touched.getTime())/1000;
				if (idle > Connection.CONNTIMEOUT) await this.release();
			}
		}

		this.keepalive();
	}

	private convert(bindv:BindValue[]) : any[]
	{
		let binds:any[] = [];
		if (bindv == null) return([]);

		bindv.forEach((b) =>
		{
			let value:any = b.value;

			if (value instanceof Date)
				value = value.getTime();

			if (b.outtype) binds.push({name: b.name, type: b.type});
			else
			{
				if (value == null) binds.push({name: b.name, type: b.type});
				else binds.push({name: b.name, value: value, type: b.type});
			}
		})

		return(binds);
	}
}

export class Response
{
	public rows:any[];
	public message:string = null;
	public success:boolean = true;
}