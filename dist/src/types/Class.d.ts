/**
 * Definition of the type 'Class'
 * Javascript doesn't have a suitable
 * definition of a Class, especially since
 * it is not really Object Oriented
 */
export type Class<T> = {
    new (...args: any[]): T;
};
export declare function isClass(clazz: any): clazz is Class<any>;
