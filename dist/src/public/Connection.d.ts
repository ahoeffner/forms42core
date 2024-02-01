/**
 * Basic HTTP connection to backend.
 * This class is meant for extending and does not implement any username/password security.
 */
export declare class Connection {
    private base$;
    private headers$;
    private method$;
    private authmeth$;
    private success$;
    /**
    * Create connection. If no url specified, the Origin of the page is used
    *
    *
    * @param url constructer url string or url
    */
    constructor(url?: string | URL);
    /**
    *
    * The base url for this connection
    *
    *  @return the baseurl of url
   */
    get baseURL(): URL;
    /**
    * The authorization method. Not used in the base class.
    *
    *
    * @returns The authorization method as a string.
    */
    get authmethod(): string;
    /** The authorization method. Not used in base class
    *
    * @param method - The authorization method to set.
    */
    set authmethod(method: string);
    /** Whether the last request was successfull
    *
    *  @returns A boolean indicating the success status of the last request.
    */
    get success(): boolean;
    /** Get the request headers
    *
    *
    *@returns The request headers.
    */
    get headers(): any;
    /** Set the request headers
    *
    *
   * @param headers - The request headers to set.
    */
    set headers(headers: any);
    /** Set the base url
    *
    *
    * @param url - The base URL to set. Accepts either a string or a URL object.
    */
    set baseURL(url: string | URL);
    /** Not used in base class
    *
    *
   * @returns Always false, as not used in the base class.
    */
    get transactional(): boolean;
    /** Perform HTTP GET
    *
    *
    * @param url - The URL for the GET request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the GET request.
    */
    get(url?: string | URL, raw?: boolean): Promise<any>;
    /** Perform HTTP POST
    *
    * @param url - The URL for the POST request. Optional.
   * @param payload - The payload for the POST request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the POST request.
    */
    post(url?: string | URL, payload?: string | any, raw?: boolean): Promise<any>;
    /** Perform HTTP PATCH
    *
    * @param url - The URL for the PATCH request. Optional.
   * @param payload - The payload for the PATCH request. Optional.
   * @param raw - Indicates whether to return the raw response. Optional.
   * @returns A promise that resolves to the response of the PATCH request.
    */
    patch(url?: string | URL, payload?: string | any, raw?: boolean): Promise<any>;
    /**
   * Invokes an HTTP request.
   *
   * @param url - The URL for the request.
   * @param payload - The payload for the request.
   * @param raw - Indicates whether to return the raw response.
   * @returns A promise that resolves to the response of the HTTP request.
   * @private
   */
    private invoke;
}
