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

import { Alert } from '../Alert.js';
import { Logger, Type } from '../Logger.js';
import { Form } from '../../public/Form.js';
import { Block } from '../../public/Block.js';
import { FormMetaData } from '../FormMetaData.js';
import { EventFilter } from '../../control/events/EventFilter.js';
import { EventListenerClass } from '../../control/events/EventListenerClass.js';


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
		else if (lsnr instanceof EventListenerClass)
		{
			FormMetaData.setListenerEvent(lsnr,method,filter);
		}
		else
		{
			Alert.fatal("Use of @formevent on non compatable class '"+lsnr.constructor.name+"'","FormEvents");
			return(null);
		}

		Logger.log(Type.metadata,"Register eventhandler "+method+" on form: "+lsnr.constructor.name+", filter: "+filter);
	}

	return(define);
}
