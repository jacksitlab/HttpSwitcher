
export enum LogLevel {

    VERBOSE = 1,
    DEBUG = 2,
    INFO = 3,
    WARN = 4,
    ERROR = 5,
}
class Log {

    private static _map: { [key: string]: LogLevel } = {
        "VERBOSE": LogLevel.VERBOSE,
        "DEBUG": LogLevel.DEBUG,
        "INFO": LogLevel.INFO,
        "WARN": LogLevel.WARN,
        "ERROR": LogLevel.ERROR
    }
    public static fromString(s: string): LogLevel {
        return Log._map[s];
    }

    private doConsoleOutput: boolean;
    private static level: LogLevel = LogLevel.DEBUG;

    public static setLevel(lvl: LogLevel): void {
        this.level = lvl;
    }
    public constructor(doConsoleOutput: boolean = false) {
        this.doConsoleOutput = doConsoleOutput;
    }
    public debug(message: string | undefined, data?: object[]) {
        this.log(LogLevel.DEBUG, message, data);
    }
    public warn(message: string | undefined, data?: object[]) {
        this.log(LogLevel.WARN, message, data);
    }
    public error(message: string | undefined, data?: object[]) {
        this.log(LogLevel.ERROR, message, data);
    }
    public info(message: string | undefined, data?: object[]) {
        this.log(LogLevel.INFO, message, data);
    }
    public verbose(message: string | undefined, data?: object[]) {
        this.log(LogLevel.VERBOSE, message, data);

    }
    protected log(lvl: LogLevel, message: string | undefined, data: object[] = []): { logged: boolean, str: string } {

        if (lvl < Log.level || message == undefined) {
            return { logged: false, str: "" };
        }
        const r = { logged: true, str: `${new Date().toISOString()} [${this.levelStr(lvl)}] ${this.format(message, data)}` }
        if (this.doConsoleOutput) {

            console.log(r.str)
        }
        return r;
    }
    private levelStr(lvl: LogLevel) {
        var s: string = "";
        switch (lvl) {
            case LogLevel.DEBUG:
                s = "DEBUG";
                break;
            case LogLevel.ERROR:
                s = "ERROR";
                break;
            case LogLevel.INFO:
                s = "INFO";
                break;
            case LogLevel.VERBOSE:
                s = "VERBOSE";
                break;
            case LogLevel.WARN:
                s = "WARN";
                break;
        }
        return s;
    }
    private format(message: string, args: object[] = []): string {
        return message.replace(/{(\d+)}/g, (match: string, number: number) => {
            return typeof args[number] != 'undefined'
                ? args[number].toString()
                : match
                ;
        });
    }
}

export default Log;
