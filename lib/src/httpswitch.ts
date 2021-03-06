import HttpSwitchConfig from "./models/httpSwitchConfig";
import * as express from 'express';
import * as http from 'http';
import logService from './services/logService';
import fetch from 'node-fetch';
import { resolveTxt } from "dns";

export interface IHttpCallback {
    callback(options: IQueryOptions, request: express.Request): void;
}
/**
 * logical and connected
 * so every parameter has to match
 * if you needed create multiple callback querys with different options
 */
export interface IQueryOptions {
    uri?: string;
    queryParams?: { [key: string]: string | null };
}
const LOG = logService.getLog('HttpSwitchServer');
class HttpSwitchServer {

    private readonly config: HttpSwitchConfig;
    private app: express.Express;
    private server: http.Server;
    private readonly callbacks: { options: IQueryOptions, callback: IHttpCallback }[];
    public constructor(config: HttpSwitchConfig) {
        this.config = config;
        this.callbacks = [];
        this.app = express();
        this.app.get("/*", (req, resp) => { this.onGetRequest(req, resp); });
        this.app.post("/*", (req, resp) => { this.onPostRequest(req, resp); });
        this.app.put("/*", (req, resp) => { this.onPutRequest(req, resp); });
        this.app.delete("/*", (req, resp) => { this.onDeleteRequest(req, resp); });
        this.server = http.createServer(this.app);
    }

    private onGetRequest(request: express.Request, response: express.Response) {

        this.callbacks.forEach((callback) => {
            if (this.matches(callback.options, request)) {
                callback.callback.callback(callback.options, request);
            }
        });
        this.forwardGetRequest(request, response);

    }
    private onPostRequest(request: express.Request, response: express.Response) {

        this.forwardRequest(request, response);

    }
    private onPutRequest(request: express.Request, response: express.Response) {

        this.forwardRequest(request, response);

    }
    private onDeleteRequest(request: express.Request, response: express.Response) {

        this.forwardRequest(request, response);

    }
    private static kebabToCamelCase(input: string): string {
        let arr = input.split('-');
        let capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item);
        return capital.join("");
    }
    private convertHeaders(headers: http.IncomingHttpHeaders): { [key: string]: string } {
        const data: { [key: string]: string } = {};
        Object.keys(headers).forEach((key) => {
            const ckey = HttpSwitchServer.kebabToCamelCase(key);
            const value = headers[key];
            if (value instanceof Array) {
                data[ckey] = (value as string[]).join(";")
            }
            else if (value != null) {
                data[ckey] = value;
            }
        });
        return data;
    }
    private async forwardGetRequest(request: express.Request, response: express.Response) {
        const url2 = this.config.remoteUrl + request.url;
        LOG.debug("forwarding GET request")
        LOG.debug(`url=${request.url}`)
        LOG.debug(`query=${JSON.stringify(request.query)}`)
        LOG.debug(`params=${JSON.stringify(request.params)}`)
        LOG.debug(`forward to ${url2}`);
        const result = await fetch(url2, { method: 'GET', headers: this.convertHeaders(request.headers) });
        const resheaders: { [key: string]: string } = {};
        for (var pair of result.headers.entries()) {
            LOG.debug(`response header=${pair[0]} : ${pair[1]}`)
            if (pair[0] == "connection") {
                continue;
            }
            resheaders[pair[0]] = pair[1].replace(/;\s*$/, "");

        }
        //resheaders["content-type"] = "text/html; charset=UTF-8"
        response.status(result.status);
        response.header(resheaders);
        response.send(await result.text());

    }
    private async forwardRequest(request: express.Request, response: express.Response) {
        const url2 = this.config.remoteUrl + request.url;
        LOG.debug(`forwarding ${request.method} request`)
        LOG.debug(`url=${request.url}`)
        LOG.debug(`query=${JSON.stringify(request.query)}`)
        LOG.debug(`params=${JSON.stringify(request.params)}`)
        LOG.debug(`forward to ${url2}`);
        const result = await fetch(url2, { method: request.method, body: request.body, headers: this.convertHeaders(request.headers) });
        const resheaders: { [key: string]: string } = {};
        for (var pair of result.headers.entries()) {
            LOG.debug(`response header=${pair[0]} : ${pair[1]}`)
            //if (pair[0] == "connection") {
            //    continue;
            //}
            resheaders[pair[0]] = pair[1].replace(/;\s*$/, "");

        }
        response.status(result.status);
        response.header(resheaders);
        response.send(await result.text());

    }
    private matches(options: IQueryOptions, request: express.Request): boolean {
        const idx = request.url.indexOf("?");
        const uri = idx < 0 ? request.url : request.url.substring(0, idx);
        let matches = true;
        //no filter enabled => no callback
        if (!options.uri && !options.queryParams) {
            return false;
        }
        if (options.uri) {
            LOG.debug(`test match for ${request.url} and ${options.uri}`)
            if (request.url.indexOf(options.uri) > -1) {
                LOG.debug("match")
                matches = true;
            }
        }
        if (options.queryParams) {
            Object.keys(options.queryParams).forEach((queryParamKey) => {
                if (options.queryParams) {
                    //has value (check for key and value)
                    if (options.queryParams[queryParamKey]) {
                        LOG.debug(`checking query for ${queryParamKey} in ${JSON.stringify(request.query)}`)
                        const v = this.getQueryParamValue(request, queryParamKey);
                        LOG.debug(`found query value ${v} for ${queryParamKey}`)
                        matches = matches && (v == options.queryParams[queryParamKey]);
                    }
                    //has only key (only check for key)
                    else {
                        matches = matches && this.containsQueryParam(request, queryParamKey);
                    }
                }
            });
        }
        return matches;
    }
    private containsQueryParam(request: express.Request, param: string): boolean {
        return this.getQueryParamValue(request, param) ? true : false;
    }
    private getQueryParamValue(request: express.Request, param: string): string | null {
        const query = request.query;
        const v = query[param];
        return v ? v.toString() : null;
    }
    public registerCallback(options: IQueryOptions, callback: IHttpCallback) {
        this.callbacks.push({ options: options, callback: callback });
    }

    public start(): void {
        this.server.listen(this.config.port, () => {
            LOG.info('Server started listening on port ' + this.config.port + '.');
        });
    }
    public stop(): void {
        this.server.close();

    }
}
export default HttpSwitchServer