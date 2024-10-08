import { Injectable } from '@angular/core';
import { LogPublisher } from 'src/app/@core/models/shared/logger/log-publishers.model';
import { LogEntry } from 'src/app/@core/models/shared/logger/logger.model';
import { LoggerPublishersService } from './logger-publishers.service';

@Injectable({
  providedIn: 'root'
})

export class LoggerService {
  level: LogLevel = LogLevel.All;
  logWithDate: boolean = true;
  private publishers: LogPublisher[] = [];

  constructor(private publishersService: LoggerPublishersService) {
    this.publishers = publishersService.publishers;
  }

  info(msg: string, ...optionalParams: any[]) {
    this.writeToLog(msg, LogLevel.Info, optionalParams);
  }

  warn(msg: string, ...optionalParams: any[]) {
    this.writeToLog(msg, LogLevel.Warn, optionalParams);
  }

  error(msg: string, ...optionalParams: any[]) {
    this.writeToLog(msg, LogLevel.Error, optionalParams);
  }

  log(msg: string, ...optionalParams: any[]) {
    this.writeToLog(msg, LogLevel.Debug, optionalParams);
  }

  private writeToLog(msg: string, level: LogLevel, params: any[]) {
    if (this.shouldLog(level)) {
      let entry: LogEntry = new LogEntry();
      entry.message = msg;
      entry.level = level;
      entry.extraInfo = params;
      entry.logWithDate = this.logWithDate;

      for (let logger of this.publishers)
        logger.log(entry).subscribe(response => console.log(response));
    }
  }
  private shouldLog(level: LogLevel): boolean {
    let ret: boolean = false;
    if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.All) {
      ret = true;
    }
    return ret;
  }

}

export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Off = 5
}