/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { Connection as RestConnection } from "../database/Connection.js";
/**
 * Connection to DatabaseJS.
 */
export class DatabaseConnection {
    conn$ = null;
    /** Lock limit, scope != stateless
    *
    *
    * @public
   * @returns The maximum number of locks.
    */
    static get MAXLOCKS() {
        return (RestConnection.MAXLOCKS);
    }
    /** Lock limit, scope != stateless
    *
    *
   * @public
   * @param timeout - The timeout value to set.
    */
    static set MAXLOCKS(timeout) {
        RestConnection.MAXLOCKS = timeout;
    }
    /** Transaction timeout in seconds, only with scope=transactional
    *
    *
   * @public
   * @returns The transaction timeout in seconds.
    */
    static get TRXTIMEOUT() {
        return (RestConnection.TRXTIMEOUT);
    }
    /** Transaction timeout in seconds, only with scope=transactional
    *
    * @public
   * @param timeout - The timeout value to set.
    */
    static set TRXTIMEOUT(timeout) {
        RestConnection.TRXTIMEOUT = timeout;
    }
    /** Lock inspection interval in seconds, only with scope!=stateless
    *
   * @public
   * @returns The lock inspection interval in seconds.
   */
    static get LOCKINSPECT() {
        return (RestConnection.LOCKINSPECT);
    }
    /** Lock inspection interval in seconds, only with scope!=stateless
    *
    *
   * @public
   * @param timeout - The timeout value to set.
   */
    static set LOCKINSPECT(timeout) {
        RestConnection.LOCKINSPECT = timeout;
    }
    /** Connection timeout in seconds, only with scope=transactional
    *
   * @public
   * @returns The connection timeout in seconds.
   */
    static get CONNTIMEOUT() {
        return (RestConnection.CONNTIMEOUT);
    }
    /** Connection timeout in seconds, only with scope=transactional
    *
   * @public
   * @param timeout - The timeout value to set.
   */
    static set CONNTIMEOUT(timeout) {
        RestConnection.CONNTIMEOUT = timeout;
    }
    /** See connection
    *
   * @public
   * @constructor
   * @param url - The URL of the database.
   */
    constructor(url) {
        this.conn$ = new RestConnection(url);
    }
    /** Number of row locks
    *
   * @public
   * @returns The number of row locks.
   */
    get locks() {
        return (this.conn$.locks);
    }
    /** Number of row locks
    *
   * @public
   * @param locks - The number of row locks to set.
   */
    set locks(locks) {
        this.conn$.locks = locks;
    }
    /** The connection scope
    *
   * @public
   * @returns The connection scope.
   */
    get scope() {
        return (this.conn$.scope);
    }
    /** The connection scope
    *
    * @public
    * @param scope - The connection scope to set.
    */
    set scope(scope) {
        this.conn$.scope = scope;
    }
    /** The authorization method
    *
   * @public
   * @returns The authorization method.
   */
    get authmethod() {
        return (this.conn$.authmethod);
    }
    /** The authorization method  *
    *
   * @public
   * @param method - The authorization method to set.
   */
    set authmethod(method) {
        this.conn$.authmethod = method;
    }
    /** Is connection scope transactional
    *
   * @public
   * @returns A boolean indicating whether the connection scope is transactional.
   */
    get transactional() {
        return (this.conn$.transactional);
    }
    /** Add attribute to be passed on to backend
    *
   * @public
   * @param name - The name of the attribute.
   * @param value - The value of the attribute.
   */
    addAttribute(name, value) {
        this.conn$.addAttribute(name, value);
    }
    /** Delete attribute to be passed on to backend
    *
    *
   * @public
   * @param name - The name of the attribute to delete.
   */
    deleteAttribute(name) {
        this.conn$.deleteAttribute(name);
    }
    /** Add clientinfo to be passed on to database
    *
   * @public
   * @param name - The name of the client info.
   * @param value - The value of the client info.
   */
    addClientInfo(name, value) {
        this.conn$.addClientInfo(name, value);
    }
    /** Delete clientinfo to be passed on to database
    *
   * @public
   * @param name - The name of the client info to delete.
   */
    deleteClientInfo(name) {
        this.conn$.deleteClientInfo(name);
    }
    /** Connects to the database.
   *
   * @public
   * @param username - The username for the database connection.
   * @param password - The password for the database connection.
   * @param custom - Custom data for the connection.
   * @returns A promise that resolves to a boolean indicating the success of the connection.
   */
    async connect(username, password, custom) {
        return (this.conn$.connect(username, password, custom));
    }
    /**
   * Disconnects from the database.
   *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the disconnection.
   */
    async disconnect() {
        return (this.conn$.disconnect());
    }
    /** Is connected to database
    *
   * @public
   * @returns A boolean indicating whether the connection is established.
   */
    connected() {
        return (this.conn$.connected());
    }
    /** Commit all transactions
    *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the commit.
   */
    async commit() {
        return (this.conn$.commit());
    }
    /** Rollback all transactions  *
    *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the rollback.
   */
    async rollback() {
        return (this.conn$.rollback());
    }
    /** Execute insert    *
   * @public
   * @param payload - The SQLRest payload for the insert operation.
   * @returns A promise that resolves to the result of the insert operation.
   */
    async insert(payload) {
        return (this.conn$.insert(payload));
    }
    /** Execute update   *
    *
   * @public
   * @param payload - The SQLRest payload for the update operation.
   * @returns A promise that resolves to the result of the update operation.
   */
    async update(payload) {
        return (this.conn$.update(payload));
    }
    /** Execute delete
    *
   * @public
   * @param payload - The SQLRest payload for the delete operation.
   * @returns A promise that resolves to the result of the delete operation.
   */
    async delete(payload) {
        return (this.conn$.delete(payload));
    }
    /** Execute script
    * Executes a script.
   *
   * @public
   * @param steps - The steps of the script.
   * @param attributes - Additional attributes for the script.
   * @returns A promise that resolves to the result of the script.
   */
    async script(steps, attributes) {
        return (this.conn$.script(steps, attributes));
    }
    /** Execute batch   *
   * @public
   * @param stmts - The statements to execute in a batch.
   * @param attributes - Additional attributes for the batch.
   * @returns A promise that resolves to an array of results for each statement in the batch.
   */
    async batch(stmts, attributes) {
        return (this.conn$.batch(stmts, attributes));
    }
}
