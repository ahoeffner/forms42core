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

import { Class } from '../types/Class.js';
import { Include } from '../tags/Include.js';

import { Canvas as CanvasImpl } from './Canvas.js';
import { Canvas as CanvasType } from './interfaces/Canvas.js';
import { Canvas as CanvasProperties } from './properties/Canvas.js'

import { ComponentFactory } from './interfaces/ComponentFactory.js';
import { ComponentFactory as FactoryImpl } from './ComponentFactory.js';

import { Menu } from '../tags/Menu.js';
import { CustomTag } from '../tags/CustomTag.js';


export class Properties
{
    public static parseTags:boolean = true;
    public static parseEvents:boolean = true;

    public static CanvasImplementationClass:Class<CanvasType> = CanvasImpl;
    public static FactoryImplementationClass:ComponentFactory = new FactoryImpl();

    public static TagLibrary:Map<string,Class<CustomTag>> = new Map
    (
        [
            ["menu",Menu],
            ["include",Include]
        ]
    );

    /*
            ["menu",{tag: Tag.Menu, element: "div"}],
            ["data",{tag: Tag.Data, element: "span"}],
            ["forms",{tag: Tag.Root, element: "div"}],
            ["include",{tag: Tag.Include, element: null}],
            ["calendar",{tag: Tag.Calendar, element: "div"}],
            ["listofvalues",{tag: Tag.ListOfValues, element: "div"}]

    */

    public static CanvasProperties:CanvasProperties = new CanvasProperties();
}