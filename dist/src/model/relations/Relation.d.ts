import { Key } from "./Key";
export interface Relation {
    master: Key;
    detail: Key;
    orphanQueries: boolean;
}
