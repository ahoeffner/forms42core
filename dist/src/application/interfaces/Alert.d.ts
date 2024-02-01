export interface Alert {
    fatal(msg: string, title: string): void;
    warning(msg: string, title: string): void;
    message(msg: string, title: string): void;
}
