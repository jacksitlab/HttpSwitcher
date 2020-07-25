import '../../lib/src/httpswitch'
import HttpSwitchServer, { IHttpCallback, IQueryOptions } from '../../lib/src/httpswitch';
import * as express from 'express';
import logService from '../../lib/src/services/logService';
import * as exec from 'child_process';

const LOG = logService.getLog("FoobarHttpSwitchServer");
class FoobarHttpSwitchServer extends HttpSwitchServer {

    private readonly setVolumeCallback: IHttpCallback = {
        callback(options: IQueryOptions, request: express.Request) {
            LOG.debug(`request called for ${JSON.stringify(options)} with query params=${JSON.stringify(request.query)}`);
            const params = request.query;
            if (params["param1"]) {
                const vol = parseInt(params["param1"].toString());
                if (vol >= 0 && vol <= 100) {

                }
                else {
                    LOG.warn(`invalid volume ${vol} from query ${JSON.stringify(params)}`)
                }
            }
            else {
                LOG.warn(`no param1 parameter found in query ${JSON.stringify(params)}`)
            }
        }
    }
    public constructor() {
        super({ port: 8888, remoteUrl: "http://10.20.0.180:8889" });
        const self = this;
        this.registerCallback({ queryParams: { "cmd": "Volume" } }, {
            callback(options: IQueryOptions, request: express.Request) {
                LOG.debug(`request called for ${JSON.stringify(options)} with query params=${JSON.stringify(request.query)}`);
                const params = request.query;
                if (params["param1"]) {
                    const vol = parseInt(params["param1"].toString());
                    if (vol >= 0 && vol <= 100) {
                        self.setSystemVolume(vol);
                    }
                    else {
                        LOG.warn(`invalid volume ${vol} from query ${JSON.stringify(params)}`)
                    }
                }
                else {
                    LOG.warn(`no param1 parameter found in query ${JSON.stringify(params)}`)
                }
            }
        });
    }
    private setSystemVolume(volume: number) {
        this.exec(`amixer -D pulse sset Master ${volume}%`);
    }
    public exec(args: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const script = exec.exec(`${args}`, (error, stdout, stderr) => {
                LOG.debug(stdout);
                resolve();
            });

        });

    }
}


const server = new FoobarHttpSwitchServer();
server.start();