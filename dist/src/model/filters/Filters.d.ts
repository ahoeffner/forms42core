import { Like } from "./Like.js";
import { ILike } from "./ILike.js";
import { AnyOf } from "./AnyOf.js";
import { Equals } from "./Equals.js";
import { IsNull } from "./IsNull.js";
import { NoneOf } from "./NoneOf.js";
import { Between } from "./Between.js";
import { LessThan } from "./LessThan.js";
import { Contains } from "./Contains.js";
import { SubQuery } from "./SubQuery.js";
import { GreaterThan } from "./GreaterThan.js";
import { DateInterval } from "./DateInterval.js";
/**
 * Filters is a key component when communicating with a backend.
 * This is just a convinience class gathering all basic filters into one common entry.
 */
export declare class Filters {
    static Like(column: string): Like;
    static AnyOf(column: string): AnyOf;
    static ILike(column: string): ILike;
    static Equals(column: string): Equals;
    static NoneOf(column: string): NoneOf;
    static IsNull(column: string): IsNull;
    static Contains(columns: string | string[]): Contains;
    static SubQuery(columns: string | string[]): SubQuery;
    static DateInterval(column: string): DateInterval;
    static LessThan(column: string, incl?: boolean): LessThan;
    static Between(column: string, incl?: boolean): Between;
    static GreaterThan(column: string, incl?: boolean): GreaterThan;
}
