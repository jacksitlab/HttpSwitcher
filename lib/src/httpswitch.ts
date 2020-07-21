import HttpSwitchConfig from "./models/httpSwitchConfig";
import * as express from 'express';
import * as http from 'http';
import logService from './services/logService';
import fetch from 'node-fetch';

export interface IHttpCallback {

}
export interface IQueryOptions {
    uri?: string;
    queryParams?: string[];
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
        this.server = http.createServer(this.app);
    }

    private onGetRequest(request: express.Request, response: express.Response) {

        this.callbacks.forEach((callback) => {
            if (this.matches(callback.options, request)) {

            }
        });
        this.forwardGetRequest(request, response);
    }
    private convertHeaders(headers: http.IncomingHttpHeaders): { [key: string]: string } {
        const data: { [key: string]: string } = {};
        Object.keys(headers).forEach((key) => {

        });
        if (headers.accept) {
            data["Accept"] = headers.accept;
        }
        if (headers["content-type"]) {
            data["Content-Type"] = headers["content-type"];
        }
        if (headers.authorization) {
            data["Authorization"] = headers.authorization;
        }
        return data;
        //return { "Accept": headers.accept || "", "Content-Type":headers["content-type"] || , };
    }
    private async forwardGetRequest(request: express.Request, response: express.Response) {
        const url2 = "";
        const result = await fetch(url2, { method: 'GET', headers: this.convertHeaders(request.headers) });
        response.sendStatus(result.status);
        result.headers.forEach((header) => {
            const idx = header.indexOf(":");

            response.setHeader(header.substring(0, idx), header.substring(idx + 1))
        })
        response.send(result.body)
    }
    private matches(options: IQueryOptions, request: express.Request): boolean {
        return false;
    }
    public registerCallback(options: IQueryOptions, callback: IHttpCallback) {

    }

    public start(): void {
        this.server.listen(this.config.port, () => {
            LOG.debug('Server started listening on port ' + this.config.port + '.');
        });
    }
    public stop(): void {
        this.server.close();

    }
}
export default HttpSwitchServer