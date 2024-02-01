/**
 * Some styling of the popup windows is necessary but made public through this class.
 * It is also possible for expert users to replace all popup classes completely if needed.
 */
export declare class Internals {
    static CloseButtonText: string;
    static OKButtonText: string;
    static CancelButtonText: string;
    static header: string;
    static footer: string;
    static PopupHeaderStyle: string;
    static PopupStyle: string;
    static PopupStyleLabel: string;
    static PopupStyleLogin: string;
    static PopupStyleButtonArea: string;
    static PopupStyleLowerRight: string;
    static PopupStyleIndexing: string;
    static PopupFooterStyle: string;
    static PopupCloseButton: string;
    static LoaderStyle: string;
    static stylePopupWindow(view: HTMLElement, title?: string, height?: number, width?: number): void;
}
