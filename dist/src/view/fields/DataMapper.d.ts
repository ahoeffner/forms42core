/**
 * Used with DataMapper
 */
export declare enum Tier {
    Backend = 0,
    Frontend = 1
}
/**
 * The DataMapper is used for two-way translation
 * between input data and backend data.
 *
 * E.G. Backend holds Y/N but frontend used true/false.
 *
 * DataMapper has use cases:
 * 	Translate text to images
 * 	Translate text to html-links
 */
export interface DataMapper {
    /** Get the value at the given tier */
    getValue(tier: Tier): any;
    /** Set the value at the given tier */
    setValue(tier: Tier, value: any): void;
    /** Get the value at the given tier before validated/finished */
    getIntermediateValue(tier: Tier): string;
    /** Set the value at the given tier before validated/finished */
    setIntermediateValue(tier: Tier, value: string): void;
}
