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

import { Tag } from "./Tag.js";
import { Field as Impl } from "../fields/Field.js";
import { Framework } from "../application/Framework.js";
import { FieldImplementation } from "../fields/interfaces/FieldImplementation.js";

export class Field implements Tag
{
    public parse(element:HTMLElement) : string|HTMLElement
    {
		let impl:Impl = new Impl(element);
		let field:FieldImplementation = impl.getImplementation();
        Framework.copyAttributes(element,field.getElement());
        return(field.getElement());
    }
}