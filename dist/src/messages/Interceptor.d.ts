import { Message } from "./interfaces/Message";
export interface Interceptor {
    handle(error: Message): boolean | Promise<boolean>;
}
