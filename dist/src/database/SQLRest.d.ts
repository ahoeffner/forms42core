import { BindValue } from "./BindValue";
export declare class SQLRest {
    stmt: string;
    assert: BindValue[];
    returnclause?: boolean;
    bindvalues: BindValue[];
    attributes?: {
        name: string;
        value: any;
    }[];
    toString(): string;
}
