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

/**
 * Definition of the type 'Class'.
 * JavaScript doesn't have a suitable
 * definition of a Class, especially since
 * it is not really Object Oriented.
 *
 * @typeparam T - The type of the class instance.
 */
export type Class<T> =
{
    /**
    * Constructor signature for the class.
    *
    * @param args - The arguments for the constructor.
    */
    new(...args: any[]) : T;
};

/**
 * Checks if the provided value is a class.
 *
 * @param clazz - The value to check.
 * @returns A boolean indicating whether the value is a class.
 */
export function isClass(clazz:any) : clazz is Class<any>
{
  /**
  * Check if the provided value starts with "class".
  */
	return((clazz+"").startsWith("class"));
}