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

import { Cursor } from "./Cursor.js";
import { SQLRest } from "./SQLRest.js";
import { BindValue } from "./BindValue.js";
import { Alert } from "../application/Alert.js";
import { ConnectionScope } from "./ConnectionScope.js";
import { Connection as BaseConnection } from "../public/Connection.js";

export class Connection extends BaseConnection
{
	private trx$:object = null;
	private conn$:string = null;
	private touched$:Date = null;
	private modified$:Date = null;
	private keepalive$:number = 20;
	private tmowarned$:boolean = false;
	private scope$:ConnectionScope = ConnectionScope.transactional;

	public static TIMEOUT = 20;
	public static IDLEWARN = 20;


	// Be able to get the real connection from the public
	private static conns$:Map<string,Connection> =
		new Map<string,Connection>();

	public static getConnection(name:string) : Connection
	{
		return(this.conns$.get(name));
	}

	public static getAllConnections() : Connection[]
	{
		return([...this.conns$.values()]);
	}

	public constructor(name:string, url?:string|URL)
	{
		super(name,url);
		Connection.conns$.set(name,this);
	}

	public get scope() : ConnectionScope
	{
		return(this.scope$);
	}

	public set scope(state:ConnectionScope)
	{
		if (this.connected())
		{
			Alert.warning("Connection scope cannot be changed after connect","Database Connection");
			return;
		}
		this.scope$ = state;
	}

	public async connect(username?:string, password?:string) : Promise<boolean>
	{
		if (username) this.username = username;
		if (password) this.password = password;

		let scope:string = null;

		switch(this.scope)
		{
			case ConnectionScope.stateless: scope = "none"; break;
			case ConnectionScope.dedicated: scope = "dedicated"; break;
			case ConnectionScope.transactional: scope = "transaction"; break;
		}

		if (this.scope == ConnectionScope.stateless) scope = "none";

		let payload:any =
		{
			"scope": scope,
			"auth.method": "database",
			"username": this.username,
			"auth.secret": this.password
		};

		let response:any = await this.post("connect",payload);

		if (!response.success)
		{
			console.error("failed to connect as "+this.username);
			Alert.warning(response.message,"Database Connection");
			return(false);
		}

		this.trx$ = new Object();
		this.conn$ = response.session;
		this.keepalive$ = (+response.timeout * 4/5)*1000;

		this.keepalive();
		return(true);
	}

	public connected() : boolean
	{
		return(this.conn$ != null);
	}

	public async commit() : Promise<boolean>
	{
		this.tmowarned$ = false;
		this.trx$ = new Object();
		let response:any = await this.post(this.conn$+"/commit");

		if (response.success)
		{
			this.touched$ = null;
			this.modified$ = null;
		}

		return(response.success);
	}

	public async rollback() : Promise<boolean>
	{
		this.tmowarned$ = false;
		this.trx$ = new Object();
		let response:any = await this.post(this.conn$+"/rollback");

		if (response.success)
		{
			this.touched$ = null;
			this.modified$ = null;
		}

		return(response.success);
	}

	public async select(sql:SQLRest, cursor:Cursor, rows:number, describe?:boolean) : Promise<Response>
	{
		if (describe == null)
			describe = false;

		let skip:number = 0;
		this.touched$ = new Date();

		if (cursor && cursor.trx != this.trx$)
			skip = cursor.pos;

		if (cursor && this.scope == ConnectionScope.stateless)
			skip = cursor.pos;

		let payload:any =
		{
			rows: rows,
			skip: skip,
			compact: true,
			dateformat: "UTC",
			describe: describe,

			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		if (cursor)
		{
			payload.cursor = cursor.name;

			cursor.rows = rows;
			cursor.pos += rows;
			cursor.trx = this.trx$;
			cursor.stmt = sql.stmt;
			cursor.bindvalues = sql.bindvalues;
		}

		let response:any = await this.post(this.conn$+"/select",payload);

		if (!response.success)
		{
			console.error("stmt: "+sql.stmt+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		return(response);
	}

	public async fetch(cursor:Cursor) : Promise<Response>
	{
		this.touched$ = new Date();
		let restore:boolean = false;

		if (cursor.trx != this.trx$)
			restore = true;

		if (this.scope == ConnectionScope.stateless)
			restore = true;

		if (restore)
		{
			let sql:SQLRest = new SQLRest();

			sql.stmt = cursor.stmt;
			sql.bindvalues = cursor.bindvalues;

			return(this.select(sql,cursor,cursor.rows,false));
		}

		let payload:any = {cursor: cursor.name};
		let response:any = await this.post(this.conn$+"/exec/fetch",payload);

		if (!response.success)
		{
			console.error("fetch from cursor: "+cursor+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		cursor.pos += response.rows.length;
		return(response);
	}

	public async close(cursor:Cursor) : Promise<Response>
	{
		if (this.scope == ConnectionScope.stateless)
			return({success: true, message: null, rows: []});

		let payload:any = {cursor: cursor.name, close: true};
		let response:any = await this.post(this.conn$+"/exec/fetch",payload);

		if (!response.success)
		{
			console.error("close cursor: "+cursor+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		return(response);
	}

	public async lock(sql:SQLRest) : Promise<Response>
	{
		if (this.scope == ConnectionScope.stateless)
			return({success: true, message: null, rows: []});

		let payload:any =
		{
			rows: 1,
			compact: true,
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		this.touched$ = new Date();
		this.modified$ = new Date();
		return(await this.post(this.conn$+"/select",payload));
	}

	public async refresh(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			rows: 1,
			compact: true,
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		this.touched$ = new Date();
		return(await this.post(this.conn$+"/select",payload));
	}

	public async insert(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.post(this.conn$+"/insert"+returnclause,payload);

		if (!response.success)
		{
			console.error("stmt: "+sql.stmt+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		this.touched$ = new Date();
		this.modified$ = new Date();

		return(response);
	}

	public async update(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.post(this.conn$+"/update"+returnclause,payload);

		if (!response.success)
		{
			console.error("stmt: "+sql.stmt+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		this.touched$ = new Date();
		this.modified$ = new Date();

		return(response);
	}

	public async delete(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.post(this.conn$+"/delete"+returnclause,payload);

		if (!response.success)
		{
			console.error("stmt: "+sql.stmt+" failed");
			Alert.warning(response.message,"Database Connection");
			return(response);
		}

		this.touched$ = new Date();
		this.modified$ = new Date();

		return(response);
	}

	public async call(patch:boolean, sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		this.touched$ = new Date();
		if (patch) this.modified$ = new Date();
		if (patch) return(this.patch(this.conn$+"/exec",payload));
		return(this.post(this.conn$+"/exec",payload));
	}

	public async execute(patch:boolean, sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			dateformat: "UTC",
			bindvalues: this.convert(sql.bindvalues)
		};

		this.touched$ = new Date();
		if (patch) this.modified$ = new Date();
		if (patch) return(this.patch(this.conn$+"/exec",payload));
		return(this.post(this.conn$+"/exec",payload));
	}

	private async keepalive() : Promise<void>
	{
		await this.sleep(this.keepalive$);

		let response:any = await this.post(this.conn$+"/ping",{keepalive: true});

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			this.conn$ = null;
			return(response);
		}

		if (this.scope == ConnectionScope.transactional)
		{
			if (this.modified$)
			{
				let idle:number = ((new Date()).getTime() - this.modified$.getTime())/1000;

				if (idle > 2 * Connection.IDLEWARN && this.tmowarned$)
				{
					await this.rollback();
					Alert.warning("Transaction has been rolled back. Requery to see current state","Database Connection");
				}
				else
				{
					if (idle > Connection.IDLEWARN && !this.tmowarned$)
					{
						this.tmowarned$ = true;
						Alert.warning("Transaction will be rolled back in "+Connection.IDLEWARN+" seconds","Database Connection");
					}
				}
			}

			if (this.touched$ && !this.modified$)
			{
				if ((new Date()).getTime() - this.touched$.getTime() > 1000 * Connection.TIMEOUT)
					await this.commit();
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
			if (value instanceof Date) value = value.getTime();
			if (b.outtype) binds.push({name: b.name, type: b.type});
			else binds.push({name: b.name, value: value, type: b.type});
		})

		return(binds);
	}

	private sleep(ms:number) : Promise<void>
	{
		return(new Promise(resolve => setTimeout(resolve,ms)));
	}
}

export class Response
{
	public rows:any[];
	public message:string = null;
	public success:boolean = true;
}