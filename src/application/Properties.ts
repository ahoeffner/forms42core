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
import { Include } from '../view/tags/Include.js';

import { Canvas as CanvasImpl } from './Canvas.js';
import { Canvas as CanvasType } from './interfaces/Canvas.js';
import { Canvas as CanvasProperties } from './properties/Canvas.js'

import { ComponentFactory } from './interfaces/ComponentFactory.js';
import { ComponentFactory as FactoryImpl } from './ComponentFactory.js';

import { Tag } from '../view/tags/Tag.js';
import { Root } from '../view/tags/Root.js';
import { Field } from '../view/tags/Field.js';
import { Foreach } from '../view/tags/Foreach.js';


export class Properties
{
    public static RootTag:string = "forms";
    public static AttributePrefix:string = "$";

    public static ParseTags:boolean = true;
    public static ParseEvents:boolean = true;

    public static CanvasImplementationClass:Class<CanvasType> = CanvasImpl;
    public static FactoryImplementationClass:ComponentFactory = new FactoryImpl();

    public static getTagLibrary() : Map<string,Class<Tag>>
    {
        return(
            new Map
            (
                [
                    ["field",Field],
                    ["include",Include],
                    [Properties.RootTag,Root]
                ]
            ));
    }

    public static getAttributeLibrary() : Map<string,Class<Tag>>
    {
        return(
            new Map
            (
                [
                    ["for",Foreach]
                ]
            ));
    }

    /*
            ["calendar",{tag: Tag.Calendar, element: "div"}],
            ["listofvalues",{tag: Tag.ListOfValues, element: "div"}]

    */

    public static CanvasProperties:CanvasProperties = new CanvasProperties();
}