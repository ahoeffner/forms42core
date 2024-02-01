import { DateToken } from './dates.js';
export interface datepart {
    token: string;
    delim: string;
}
export declare class utils {
    static date(): string;
    static full(): string;
    static delim(): string;
    static parse(datestr: string, withtime: boolean, format?: string): Date;
    static format(date: Date, format?: string): string;
    static tokenize(date: Date, format?: string): DateToken[];
}
