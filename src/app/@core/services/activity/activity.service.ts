import { Injectable } from "@angular/core";
import {BehaviorSubject, catchError, map, Observable} from "rxjs";
import { HttpService } from "../shared/http/http.service";
import {IActivity} from "../../models/activity/activity";
import {IActivityLog} from "../../models/activity/activityLog";

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  private uri: string = "ActivityLog";
  public items = new BehaviorSubject<IActivity[]>([]);
  public userActivities = new BehaviorSubject<IActivity[]>([]);
  constructor(private httpService: HttpService){

  }

  getAllActivityLog(): Observable<IActivity[]> {
    return this.httpService.get<IActivity[]>(`${this.uri}`).pipe(map(res => this.mapNullProperties(res)));
  }

  saveActivityLog(activity: IActivityLog): Observable<IActivityLog[]> {
    return this.httpService.post<IActivityLog[]>(activity, `${this.uri}`)
      .pipe(
        catchError(err => {
          throw err;
        })
      );
  }

  setUserActivityLog(activities: IActivity[]) {
    //let filteredActivities = activities.filter((r: IActivity) => r.email === "user@mail.com");
    let filteredActivities = activities?.filter((r: IActivity) => r.projectName !== "");
    let sortedActivities = filteredActivities?.sort((a: IActivity, b: IActivity) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    this.userActivities.next(sortedActivities?.slice(0, 5));
  }

  mapNullProperties(data) {

    return data.map(objWithNull => {
      const objWithoutNull = {...objWithNull};
      Object.keys(objWithoutNull).forEach(key => {
        if (objWithoutNull[key] === null) {
          objWithoutNull[key] = '';
        }
      });
      return objWithoutNull;
    });
  }
}
