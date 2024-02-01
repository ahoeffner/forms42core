/**
 * Constraint on dates.
 * Used with datepicker to eliminate certain dates ie weekends, holidays, ...
 */
export interface DateConstraint {
    /** The error message if picked */
    message: string;
    /** Check date for validity */
    valid(date: Date): boolean;
}
