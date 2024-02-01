/**
 * Some styling of the date-picker is necessary but made public through this class.
 * It is also possible for expert users to replace the date-picker class completely if needed.
 */
export declare class DatePicker {
    static datePickerDateStyle: string;
    static datePickerMonthStyle: string;
    static datePickerMthTextStyle: string;
    static datePickerArrowStyle: string;
    static datePickerWeekStyle: string;
    static datePickerDayStyle: string;
    static datePickerSelectedDay: string;
    static datePickerSelectedDate: string;
    static styleDatePicker(view: HTMLElement): void;
}
