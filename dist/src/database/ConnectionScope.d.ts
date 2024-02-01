/**
 * The scope of the connection
 * When @transactional connections are dedicated
 * during a transaction, but otherwise shared when idle
 */
export declare enum ConnectionScope {
    stateless = 0,
    dedicated = 1,
    transactional = 2
}
