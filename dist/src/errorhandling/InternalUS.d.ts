import { Group } from "./interfaces/Group.js";
import { Bundle } from "./interfaces/Bundle.js";
import { Message } from "./interfaces/Message.js";
export declare class InternalUS implements Bundle {
    lang: string;
    name: string;
    groups: Group[];
    messages: Message[];
}
