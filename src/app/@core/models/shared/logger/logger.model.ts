import { LogLevel } from 'src/app/@core/services/shared/logger/logger.service';
import { FSBConstants } from 'src/app/shared/Infrastructure/constants/constants';
import { LogPublisher } from './log-publishers.model';

export class LogEntry {
    date: Date = new Date();
    message: string = '';
    level: LogLevel = LogLevel.Debug;
    extraInfo: any[] = [];
    logWithDate: boolean = true;
    publishers: LogPublisher[] = [];

    buildLogString(): string {
        let ret: string = '';

        if (this.logWithDate)
            ret = `${new Date().toLocaleString(FSBConstants.dateFormat)} - `;

        ret += `TYPE:  ${LogLevel[this.level]} - `;
        ret += `MESSAGE:  ${this.message} - `;

        if (this.extraInfo.length)
            ret += `PARAMETERS:  ${this.formatParams(this.extraInfo)}`;

        return ret;
    }

    private formatParams = (params: any[]): string => {
        let ret: string = params.join(',');
        // Is there at least one object in the array?
        if (params.some(p => typeof p == 'object')) {
            ret = '';

            // Build comma-delimited string
            for (let item of params)
                ret += JSON.stringify(item) + ',';
        }
        return ret;
    }
}

