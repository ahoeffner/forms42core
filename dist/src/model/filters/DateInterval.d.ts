import { Between } from "./Between.js";
/**
 * Filters is a key component when communicating with a backend.
 * The DateInterval filter extends the Between filter and should
 * be used instead of constructions like trunc(col) = trunc(date)
 * that in most cases cannot use an index on the column.
 */
export declare class DateInterval extends Between {
    constructor(column: string);
    Day(date?: Date): DateInterval;
    Week(date?: Date, start?: number): DateInterval;
    Month(date?: Date): DateInterval;
    Year(date?: Date): DateInterval;
}
