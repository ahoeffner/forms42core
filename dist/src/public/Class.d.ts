/**
 * Definition of the type 'Class'.
 * JavaScript doesn't have a suitable
 * definition of a Class, especially since
 * it is not really Object Oriented.
 *
 * @typeparam T - The type of the class instance.
 */
export type Class<T> = {
    /**
    * Constructor signature for the class.
    *
    * @param args - The arguments for the constructor.
    */
    new (...args: any[]): T;
};
/**
 * Checks if the provided value is a class.
 *
 * @param clazz - The value to check.
 * @returns A boolean indicating whether the value is a class.
 */
export declare function isClass(clazz: any): clazz is Class<any>;
