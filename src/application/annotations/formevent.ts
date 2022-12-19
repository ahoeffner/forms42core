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

import { Logger, Type } from '../Logger.js';
import { Form } from '../../public/Form.js';
import { FormMetaData } from '../FormMetaData.js';
import { EventFilter } from '../../control/events/EventFilter.js';
import { Block } from '../../public/Block.js';


export const formevent = (filter:EventFilter|EventFilter[]) =>
{
	function define(lsnr:any, method:string)
	{
		if (lsnr instanceof Form)
		{
			FormMetaData.get(lsnr,true).formevents.set(method,filter);
		}
		else if (lsnr instanceof Block)
		{
			FormMetaData.setBlockEvent(lsnr,method,filter);
		}
		else
		{
			console.log("some class")
		}

		Logger.log(Type.metadata,"Register eventhandler "+method+" on form: "+lsnr.name+", filter: "+filter);
	}

	return(define);
}
