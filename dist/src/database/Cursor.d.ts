import { BindValue } from "./BindValue";
export declare class Cursor {
    pos: number;
    rows: number;
    trx: object;
    name: string;
    stmt: string;
    eof: boolean;
    bindvalues: BindValue[];
    private static id;
    constructor(name?: string);
}
