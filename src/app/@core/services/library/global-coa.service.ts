import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICoaModel } from '../../models/library/coa-models';
import { HttpService } from '../shared/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalCoaService {
  private uri: string = 'Libraries/GlobalCoa';
  public items = new BehaviorSubject<ICoaModel[]>([]);

  constructor(private httpService: HttpService) { }

  getList(): Observable<ICoaModel[]> {
    return this.httpService.get<ICoaModel[]>(this.uri)
  }

  post(item: any): Observable<string> {
    return this.httpService.post<string>(item, this.uri)
  }

  update(item: any): Observable<boolean> {
    return this.httpService.put<boolean>(item, this.uri)
  }

  toggleStatus(item: ICoaModel): Observable<boolean> {
    return this.httpService.patch<boolean>({ active: item.active }, `${this.uri}/${item.id}`)
  }

  delete(id: string) {
    return this.httpService.delete<boolean>(id, this.uri);
  }
}
