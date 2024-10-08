import { Injectable } from '@angular/core';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { IEngagement, IEntityScreenModel } from '../../models/entityScreen/entityScreenModel.interface';
import { HttpService } from '../shared/http/http.service';
import { IGenericEntity } from '../../models/shared/entity-model';
import { ServicesUtils } from '../shared/utils.model';
@Injectable({
  providedIn: 'root'
})
export class EngagementService extends ServicesUtils{
  private uri = 'Client/Engagement';
  public items = new BehaviorSubject<IEntityScreenModel[]>([]);

  constructor(private httpService: HttpService) {
    super()
  }

  addItemUI(item: IEntityScreenModel): void {
    this.items.next(this.items.getValue().concat([item]))
  }

  updateItemUI(updateItem: IEntityScreenModel): void {
    this.items.next(this.items.getValue().map(item => item.id === updateItem.id ? updateItem : item))
  }

  deleteItemUI(id: string) {
    this.items.next(this.items.getValue().filter(x=>x.id !== id))
  }

  getById(id: string): Observable<IEngagement> {
    return this.httpService.getById<IEngagement>(id, this.uri)
  }

  getList(): Observable<IEngagement[]> {
    return this.httpService.get<IEngagement[]>(this.uri)
  }

  post(item: any): Observable<string> {
    return this.httpService.post<string>(item, this.uri)
  }

  update(item: IEngagement): Observable<boolean> {
    return this.httpService.put<boolean>(item, this.uri)
  }

  toggleStatus(item: IGenericEntity): Observable<boolean> {
    return this.httpService.patch<boolean>({ active: item.active }, `${this.uri}/ToggleStatus/${item.id}`)
  }

  delete(id: string) {
    return this.httpService.delete<boolean>(id, this.uri);
  }
}
