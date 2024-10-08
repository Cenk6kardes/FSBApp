import { Observable, of } from 'rxjs';
import { LogLevel } from 'src/app/@core/services/shared/logger/logger.service';
import { LogEntry } from './logger.model';
import { HttpService } from '../../../services/shared/http/http.service';

export abstract class LogPublisher {
    location: string;
    abstract log(record: LogEntry):Observable<boolean>;
    abstract clear(): Observable<boolean>;
    constructor(){
        this.location= '';
    }
}

export class LogConsole extends LogPublisher {
    log(entry: LogEntry): Observable<boolean> {
        // Log to console
        switch(entry.level){
            case LogLevel.All || LogLevel.Debug: console.log(entry.buildLogString()); break;
            case LogLevel.Error:  console.error(entry.buildLogString()); break;
            case LogLevel.Info: console.info(entry.buildLogString()); break;
            case LogLevel.Warn: console.warn(entry.buildLogString()); break;
            default:  console.log(entry.buildLogString()); break;
          }
        return of(true);
    }
    
    clear(): Observable<boolean> {
        console.clear();
        return of(true);
    }
}

export class LogLocalStorage extends LogPublisher {
    constructor() {
        // Must call `super()`from derived classes
        super();
        
        // Set location
        this.location = "logging";
    }
    
    // Append log entry to local storage
    log(entry: LogEntry): Observable<boolean> {
        let ret: boolean = false;
        let values: LogEntry[];
        
        try {
            // Get previous values from local storage
            values = JSON.parse(localStorage.getItem(this.location)!) || [];
            
            // Add new log entry to array
            values.push(entry);
            
            // Store array into local storage
            localStorage.setItem(this.location, JSON.stringify(values));
            
            // Set return value
            ret = true;
        } catch (ex) {
            // Display error in console
            console.log(ex);
        }
        
        return of(ret);
    }
    
    // Clear all log entries from local storage
    clear(): Observable<boolean> {
        localStorage.removeItem(this.location);
        return of(true);
    }
}

export class LogWebApi extends LogPublisher {
    constructor(private http: HttpService) {
        // Must call `super()`from derived classes
        super();
        
        // Set location
        this.location = "/api/log";
    }
    
    // Add log entry to back end data store
    log(entry: LogEntry): Observable<boolean> {
        return this.http.post(entry, this.location);
    }
    
    clear(): Observable<boolean> {
        // TODO: Call Web API to clear all values
        return of(true);
    }
}