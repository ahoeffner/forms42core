/**
 * Javascript doesn't have a lot of datatypes which often causes
 * problems with e.g databases. DataType is used for specifying the
 * mapping to a data type on the backend.
 */
export declare enum DataType {
    int = 0,
    integer = 1,
    smallint = 2,
    long = 3,
    float = 4,
    double = 5,
    number = 6,
    numeric = 7,
    decimal = 8,
    date = 9,
    datetime = 10,
    timestamp = 11,
    string = 12,
    varchar = 13,
    varchar2 = 14,
    text = 15,
    boolean = 16
}
