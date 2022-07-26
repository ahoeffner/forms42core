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

/*
	PreForm has block null

	Pre- On- and When- cannot start new transaction in same block

	Key 		-> All
	Mouse 		-> All
	Connect 	-> All
	DisConnect 	-> All

	OnCloseForm	-> change values and properties
	OnTyping 	-> change values and properties
	OnFetch 	-> change values and properties
    OnLockRecord -> change values and properties

	WhenValidateField -> change values and properties
	WhenValidateRecord -> change values and properties

	PreQuery	-> change values ?
	PreDelete	-> change values
	PreUpdate 	-> change values
	PreInsert 	-> change values
*/

export enum EventType
{
	Key,
	Mouse,

	Connect,
	Disconnect,

	OnCloseForm,
	PostViewInit,
	PostFormFocus,

	PreForm,
	PostForm,

	PreBlock,
	PostBlock,

    PreRecord,
    PostRecord,

    PreField,
    PostField,

	OnTyping,
	WhenValidateField,

    OnFetch,
	PreQuery,
	PostQuery,

    PreInsert,
    PostInsert,

    PreUpdate,
    PostUpdate,

    PreDelete,
    PostDelete,

    OnLockRecord,
	WhenValidateRecord
}