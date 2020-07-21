import Log, { LogLevel } from "../models/log";
import * as fs from 'fs';

const LOGFILENAME = "/var/log/itlab/itlab-server.log";

export class ModuleLog extends Log {
    private filename: string | null;
    private readonly moduleName: string;
    public constructor(moduleName: string, filename: string | null = null, doConsoleOutput: boolean = false) {
        super(doConsoleOutput);
        this.moduleName = moduleName;
        this.filename = filename;
    }

    protected log(lvl: LogLevel, message: string, data?: object[]): { logged: boolean, str: string } {

        const result = super.log(lvl, this.moduleName + " " + message, data);

        if (result.logged && this.filename != null) {

            if (fs.existsSync(this.filename)) {
                fs.appendFileSync(this.filename, `${result.str}\n`)
            }
            return { logged: true, str: result.str };
        }
        return result;
    }
}
class LogService {

    private filename: string | null;
    private doConsoleOutput: boolean;
    public constructor(filename: string | null = null, doConsoleOutput: boolean = false) {
        this.filename = filename;
        this.doConsoleOutput = doConsoleOutput;
        try {

            if (!fs.existsSync(LOGFILENAME)) {
                fs.writeFileSync(LOGFILENAME, "");
            }
        }
        catch (e) {

        }
    }

    public getLog(moduleName: string) {
        return new ModuleLog(moduleName, this.filename, this.doConsoleOutput);
    }

}
const logService = new LogService(LOGFILENAME, true);
export default logService;