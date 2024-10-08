import { Injectable } from '@angular/core';
import { LogPublisher, LogConsole, LogLocalStorage } from 'src/app/@core/models/shared/logger/log-publishers.model';
import { LogWebApi } from '../../../models/shared/logger/log-publishers.model';

@Injectable({
  providedIn: 'root'
})
export class LoggerPublishersService {

  constructor() {
    // Build publishers arrays
    this.buildPublishers();
}

// Public properties
publishers: LogPublisher[] = [];

buildPublishers(): void {
    // Add logs
    this.publishers.push(new LogConsole());
    this.publishers.push(new LogLocalStorage());
    // this.publishers.push(new LogWebApi(httpService))
}
}
