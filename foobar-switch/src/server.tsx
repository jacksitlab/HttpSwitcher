import '../../lib/src/httpswitch'
import HttpSwitchServer, { IHttpCallback } from '../../lib/src/httpswitch';


class FoobarHttpSwitchServer extends HttpSwitchServer {

    private readonly setVolumeCallback: IHttpCallback = {

    }
    public constructor() {
        super({ port: 8889, remoteUrl: "http://10.20.0.180:8888" });

        this.registerCallback({}, this.setVolumeCallback);
    }
}


const server = new FoobarHttpSwitchServer();
server.start();