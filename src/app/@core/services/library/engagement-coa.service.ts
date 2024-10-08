import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpService } from '../shared/http/http.service';
import { ICoaModel } from '../../models/library/coa-models';

@Injectable({
  providedIn: 'root'
})
export class EngagementCoaService {
  private uri: string = 'Libraries/EngagementCoa';
  public items = new BehaviorSubject<ICoaModel[]>([]);

  constructor(private httpService: HttpService) { }


  getById(id: string): Observable<ICoaModel> {
    return this.httpService.getById<ICoaModel>(id, this.uri)
  }

  getList(): Observable<ICoaModel[]> {
    return this.httpService.get<ICoaModel[]>(this.uri)
  }

  getListByEntity(entityId: string): Observable<ICoaModel[]> {
    return this.httpService.get<ICoaModel[]>(`${this.uri}ByEntity/${entityId}`)
  }

  post(item: any): Observable<string> {
    return this.httpService.post<string>(item, this.uri)
  }

  update(item: any): Observable<boolean> {
    return this.httpService.put<boolean>(item, this.uri)
  }
  
  updateEngagementMapping(item: any): Observable<boolean> {
    return this.httpService.put<boolean>(item.engagements, `${this.uri}/${item.id}`)
  }

  toggleStatus(item: ICoaModel): Observable<boolean> {
    return this.httpService.patch<boolean>({ active: item.active }, `${this.uri}/${item.id}`)
  }

  delete(id: string) {
    return this.httpService.delete<boolean>(id, this.uri);
  }
}
