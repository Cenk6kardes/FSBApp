import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpService } from '../shared/http/http.service';
import * as signalR from '@microsoft/signalr';
import { ITBUploadStatus } from '../../models/projectDashboard/tbuploadstatusmodel';
import { LoggerService } from '../shared/logger/logger.service';
import { RoleManagerService } from 'src/app/auth/role-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDashboardService {

  private userId: string = '';
  private _hubConnection: signalR.HubConnection;
  public tbUploadStatusHub = new BehaviorSubject<ITBUploadStatus>({} as ITBUploadStatus);
      
  constructor(private httpService: HttpService, private logger: LoggerService,
     private roleManager: RoleManagerService) {
    this.roleManager._userId.subscribe(id => { if (id) this.userId = id });}

  getTBUpload(projectId: string): Observable<any> {
    return this.httpService.get<any>('dashboard/TBUpload/' + projectId)
  }

  getFSReview(projectId: string): Observable<any> {
    return this.httpService.get<any>('dashboard/FSReview/' + projectId)
  }

  startTBUploadStatusConnection(){
    if (environment.production){
      this._hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://dashboardapi01.azurewebsites.net/tbuploadstatusHub?UserGuid=${this.userId}`)
        .build();
    }else{
      this._hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7052/tbuploadstatusHub?UserGuid=${this.userId}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .build();
    }
    this._hubConnection.start()
    .then(() => this.logger.info('TBUploadStatus connection started'))
    .catch(err => this.logger.error('Error while starting connection: ' + err))
  }
 
  getTBUploadStatusListener() {
    return this._hubConnection.on('BroadcastTbUploadStatus', (data) => {
      this.tbUploadStatusHub.next(JSON.parse(data).Response)
    })
  }

  getTeamMembers(projectId: string): Observable<any> {
    return this.httpService.get<any>('dashboard/TeamMember/' + projectId);
  }

  getProjectActivities(projectId: string): Observable<any> {
    return this.httpService.get<any>('dashboard/ProjectActivity/' + projectId);
  }
}
