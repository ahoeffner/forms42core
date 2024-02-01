export interface DateToken {
    pos: number;
    length: number;
    mask: string;
    value: string;
    type: DatePart;
}
export interface FormatToken {
    pos: number;
    length: number;
    mask: string;
    type: DatePart;
    delimitor: string;
}
export declare enum DatePart {
    Date = 0,
    Year = 1,
    Month = 2,
    Day = 3,
    Hour = 4,
    Minute = 5,
    Second = 6
}
/** Used internally */
export declare enum WeekDays {
    Sun = 0,
    Mon = 1,
    Tue = 2,
    Wed = 3,
    Thu = 4,
    Fri = 5,
    Sat = 6
}
/**
 * Utility class for dealing with days
 */
export declare class dates {
    /** check the format mask */
    static validate(): boolean;
    /** parse a date-string into a Date using a given format. Optionally include the time part */
    static parse(datestr: string, format?: string, withtime?: boolean): Date;
    /** Get next 7 days of week */
    static getDays(start: WeekDays): Array<String>;
    /** Format a given date using a format (or default format) */
    static format(date: Date, format?: string): string;
    /** Tokenize a given date into the DateTokens */
    static tokenizeDate(date: Date, format?: string): DateToken[];
    /** Get the DatePart of a giveb token i.e. DD, MM, ... */
    static getTokenType(token: string): DatePart;
    /** Split a given format into FormatTokens */
    static tokenizeFormat(format?: string): FormatToken[];
}
