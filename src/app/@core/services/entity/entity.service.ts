import { Injectable } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { IEntity, IEntityScreenModel } from '../../models/entityScreen/entityScreenModel.interface';
import { IGenericEntity } from '../../models/shared/entity-model';
import { HttpService } from '../shared/http/http.service';
import { ServicesUtils } from '../shared/utils.model';

@Injectable({
  providedIn: 'root'
})
export class EntityService extends ServicesUtils {
  private uri = 'Client/Entity';
  public items = new BehaviorSubject<IEntityScreenModel[]>([]);
  public list = new BehaviorSubject<any[]>([]);


  constructor(private httpService: HttpService) {
    super();
  }

  addItemUI(item: IEntityScreenModel): void {
    this.items.next(this.items.getValue().concat([item]))
  }

  updateItemUI(updateItem: IEntityScreenModel): void {
    this.items.next(this.items.getValue().map(item => item.id === updateItem.id ? updateItem : item))
  }

  deleteItemUI(id: string) {
    this.items.next(this.items.getValue().filter(x => x.id !== id))
  }

  updateEntitiesUI(engagementId: string, newEntities: string[]) {
    this.items.next(this.items.getValue().map(item => {
      if (newEntities.some(id => id === item.id)) item.engagementId = engagementId;
      else if (item.engagementId === engagementId) item.engagementId = undefined;
      return item;
    }));
  }

  getById(id: string): Observable<IEntity> {
    return this.httpService.getById<IEntity>(id, this.uri)
  }

  getList(): Observable<IEntity[]> {
    return this.httpService.get<IEntity[]>(`${this.uri}/all`)
      .pipe(map(list => {
        list.forEach(item => {
          if (item.engagement) item.engagementId = item.engagement.id;
          if (item.country) item.countryId = item.country.id;
          if (item.currency) item.currencyId = item.currency.id;
          if (item.entityType) item.entityTypeId = item.entityType.id;
          if (item.industry) item.industryId = item.industry.id;
        })
        this.list.next(list.filter(item => item.active));
        return list;
      }))
  }

  post(item: any): Observable<string> {
    return this.httpService.post<string>(item, this.uri)
  }

  update(item: IEntity): Observable<boolean> {
    return this.httpService.put<boolean>(item, this.uri)
  }

  toggleStatus(item: IGenericEntity): Observable<boolean> {
    return this.httpService.patch<boolean>({ active: item.active }, `${this.uri}/ToggleStatus/${item.id}`)
  }

  delete(id: string) {
    return this.httpService.delete<boolean>(id, this.uri);
  }

  getTemplate() {
    return this.httpService.getFile<any>(`${this.uri}/GetTemplate`)
  }

  uploadTemplate(formData: FormData) {
    return this.httpService.postFiles(`${this.uri}/Template`, formData)
  }
}
