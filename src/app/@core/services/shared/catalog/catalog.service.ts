import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ICoaType, IPeriodBreak, IProjectType } from 'src/app/@core/models/shared/catalogs/catalogs-model';
import { IGenericEntity } from 'src/app/@core/models/shared/entity-model';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // public countries = new BehaviorSubject<IGenericEntity[]>([]);
  // public currencies = new BehaviorSubject<IGenericEntity[]>([]);
  // public entityTypes = new BehaviorSubject<IGenericEntity[]>([]);
  // public industries = new BehaviorSubject<IGenericEntity[]>([]);
  
  private uri: string = "Catalog";
  constructor(private httpService: HttpService) { }

  getCountries(): Observable<IGenericEntity[]> {
    return this.httpService.get<IGenericEntity[]>(`${this.uri}/country/all`)
  }

  getCurrencies(): Observable<IGenericEntity[]> {
    return this.httpService.get<IGenericEntity[]>(`${this.uri}/currency/all`)
  }
  
  getEntityTypes(): Observable<IGenericEntity[]> {
    return this.httpService.get<IGenericEntity[]>(`${this.uri}/entityType/all`)
  }

  getIndustries(): Observable<IGenericEntity[]> {
    return this.httpService.get<IGenericEntity[]>(`${this.uri}/industry/all`)
  }

  getPeriodBreak(): Observable<IPeriodBreak[]> {
    return this.httpService.get<IPeriodBreak[]>(`${this.uri}/periodBreak/all`)
  }

  getCoaType(): Observable<ICoaType[]> {
    return this.httpService.get<ICoaType[]>(`${this.uri}/coaType/all`)
  }

  getProjectType(): Observable<IProjectType[]> {
    return this.httpService.get<IProjectType[]>(`${this.uri}/projectType/all`)
  }
}
