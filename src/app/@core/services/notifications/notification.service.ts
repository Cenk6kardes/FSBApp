import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { INotificationByProject, INotificationSystemGenerting, INotificationList, INotificationsWidgets, ITimeZones, IWarning, IWarningWidget } from "../../models/notification/notifications-widgets-model";
import { HttpService } from "../shared/http/http.service";
import { ToastrService } from "../shared/toastr/toastr.service";
import * as signalR from '@microsoft/signalr';
import { RoleManagerService } from "src/app/auth/role-manager.service";

@Injectable({
    providedIn: 'root',
})

export class NotificationsServices {
    private uri: string = 'Notification';
    private systemUri: string = 'SystemNotification'
    private userId: string = '';
    private _hubConnection: signalR.HubConnection;
    public notificationWidget = new BehaviorSubject<INotificationList[]>([]);
    public warningWidget = new BehaviorSubject<IWarningWidget>({} as IWarningWidget);

    constructor(private httpService: HttpService, private toastr: ToastrService,
        private roleManager: RoleManagerService) {
        this.roleManager._userId.subscribe(id => { if (id) this.userId = id });
    }

    postNotificationsWidgets(notifications: INotificationsWidgets) {
        return this.httpService.post<INotificationsWidgets>(notifications, `${this.uri}/widgets`)
            .pipe(
                catchError(err => {
                    throw 'An error ocurred';
                }),
                tap(({
                    error: () => {
                        this.toastr.showWarning('Notification with issues', 'Notifications');
                        //
                    }
                }))
            );
    }

    postNotificationUserByEntities(notification: INotificationSystemGenerting[]) {
        return this.httpService.post<INotificationSystemGenerting[]>(notification, `${this.uri}/widgets/UserByEntities`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    postNotificationByEntity(notification: INotificationSystemGenerting) {
        return this.httpService.post<INotificationSystemGenerting>(notification, `${this.uri}/widgets/ByEntity`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    postNotificationByEngagement(notification: INotificationSystemGenerting) {
        return this.httpService.post<INotificationSystemGenerting>(notification, `${this.uri}/widgets/ByEngagement`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    postNotificationByProject(notification: INotificationSystemGenerting) {
        return this.httpService.post<INotificationSystemGenerting>(notification, `${this.uri}/widgets/ByProject`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    // Creating Notificiations
    createNotification(notification: INotificationsWidgets) {
        return this.httpService.post(notification, `${this.uri}/Notifications`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    // Deleting Notificiation
    deleteNotification(id: string) {
        return this.httpService.delete<boolean>(id, `${this.uri}/DeleteNotification`);
    }

    //Get Notifications
    getNotifications() {
        return this.httpService.get<INotificationsWidgets[]>(`${this.uri}/Notifications`)
    }

    //Mark as Read All Notifications
    markAsReadNotifications(id: string) {
        return this.httpService.put<boolean>({ userId: id }, `${this.uri}/MarkAsRead`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    //Mark as Read All Notifications
    clearAllNotifications(id: string) {
        return this.httpService.delete<boolean>(id, `${this.uri}/clearall`)
    }

    //Get System Notifications
    getSystemNotifications() {
        return this.httpService.get<IWarning>(`${this.systemUri}`)
    }

    //Get Time Zones
    getTimeZones(): Observable<ITimeZones[]> {
        return this.httpService.get<ITimeZones[]>(`${this.systemUri}/timezones`)
    }

    //Create Warning
    createWarning(warning: IWarning) {
        return this.httpService.post(warning, `${this.systemUri}`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    //Update Warning
    updateWarning(warning: IWarning) {
        return this.httpService.put(warning, `${this.systemUri}`)
            .pipe(catchError(err => {
                throw 'An error ocurred';
            }))
    }

    // Deleting Warning
    deleteWarning() {
        return this.httpService.cancel<boolean>(`${this.systemUri}/cancel`);
    }

    lockOutUser() {
        return this.httpService.get<boolean>(`${this.systemUri}/lockout`);
    }

    isWarningDissmissed(userId: string) {
        return this.httpService.get<boolean>(`${this.systemUri}/dismissed/user/${userId}`);
    }

    dismissForUser(userId: string) {
        return this.httpService.post<boolean>(userId, `${this.systemUri}/dismiss/user/${userId}`);
    }

    startNotificationConnection() {
        if (environment.production) {
            this._hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(`https://notificationapi01.azurewebsites.net/notificationmessages?UserGuid=${this.userId}`)
                .build()
        } else {
            this._hubConnection = new signalR.HubConnectionBuilder()
                //.configureLogging(signalR.LogLevel.Trace)
                .withUrl(`https://localhost:7046/notificationmessages?UserGuid=${this.userId}`, {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .build()
        }
        this._hubConnection.start()
            .then(() => console.log('notification connection started'))
            .catch(err => console.log('Error while starting connection: ' + err))
    }

    getNotificationListener() {
        return this._hubConnection.on('MyNotifications', (data) => {
            this.notificationWidget.next(JSON.parse(data).NotificationDetails)
        })
    }

    startWarningConnection() {
        if (environment.production) {
            this._hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(`https://notificationapi01.azurewebsites.net/systemNotificationHub?UserGuid=${this.userId}`)
                .build()
        } else {
            this._hubConnection = new signalR.HubConnectionBuilder()
                //.configureLogging(signalR.LogLevel.Trace)
                .withUrl(`https://localhost:7046/systemNotificationHub?UserGuid=${this.userId}`, {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets,
                })
                .build()
        }
        this._hubConnection.start()
            .then(() => console.log('warning connection started'))
            .catch(err => console.log('Error while starting connection: ' + err))
    }

    getWarningListener() {
        return this._hubConnection.on('BroadcastSystemNotification', (data) => {
            this.warningWidget.next(JSON.parse(data))
        })
    }
}