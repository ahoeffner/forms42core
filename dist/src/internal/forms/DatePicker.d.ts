import { Form } from "../Form.js";
import { WeekDays } from "../../model/dates/dates.js";
/**
 * Form emulating a calendar
 */
export declare class DatePicker extends Form {
    static WeekDayStart: WeekDays;
    private date;
    private enabled;
    private disabled;
    private leftArrow;
    private rightArrow;
    private input;
    private constraint;
    private day;
    private prevstep;
    private nextstep;
    constructor();
    private done;
    private initialize;
    private navigate;
    private setDay;
    private setDate;
    private goToNextMonth;
    private goToPrevMonth;
    private navigateMonth;
    private populateDates;
    private getFirstDayInMonth;
    private getDaysInMonth;
    static page: string;
}
