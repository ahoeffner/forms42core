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

import { Class } from "../types/Class";

import { Window as WindowImpl } from "./Window";
import { Window as WindowType } from "./interfaces/Window";
import { Window as WinProperties } from './properties/Window'

import { ComponentFactory } from './interfaces/ComponentFactory';
import { ComponentFactory as FactoryImpl } from './ComponentFactory';

export enum Tag
{
    Root,
    Data,
    Menu,
    Include,
    Calendar,
    ListOfValues
}

export class Properties
{
    public static parseTags:boolean = true;
    public static parseEvents:boolean = true;
    public static parseClasses:boolean = false;

    public static Window:WinProperties = new WinProperties();
    public static WindowImplClass:Class<WindowType> = WindowImpl;
    public static FactoryImpl:ComponentFactory = new FactoryImpl();

    public static TagLibrary:Map<string,Tag> = new Map
    (
        [
            ["data",Tag.Data],
            ["menu",Tag.Menu],
            ["forms",Tag.Root],
            ["include",Tag.Include],
            ["calendar",Tag.Calendar],
            ["listofvalues",Tag.ListOfValues]
        ]
    );
}