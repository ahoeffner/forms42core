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

import { Window } from "./interfaces/Window";

class Stack
{
    stack:Stack[] = [];
    window:Window = null;

    add(window:Window) : void
    {

    }
}

export class WindowManager
{
    private root:Stack = new Stack();

    private stack:Map<Window,Stack> =
        new Map<Window,Stack>();

    public add(caller:Window, window:Window) : void
    {
        let stack:Stack = this.stack.get(caller);;

        if (caller == null)
            stack = this.root;

        stack.add(window);
    }

    public remove(window:Window) : void
    {

    }
}
