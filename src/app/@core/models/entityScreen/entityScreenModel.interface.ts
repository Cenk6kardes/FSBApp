import {ICountry, ICurrency, IEntityType, IIndustry} from '../shared/catalogs/catalogs-model';
import {IGenericEntity} from '../shared/entity-model';

export interface IEntityScreenModel extends IGenericEntity {
  engagementId?: string,
  // selected: boolean
}

export interface IEngagement extends IGenericEntity {
  entities: string[],
  isOstensible?: boolean
}

export interface IEntity extends IGenericEntity {
  engagement: IGenericEntity,
  engagementId: string, //GUID
  ein: string,
  entityType: IEntityType,
  country: ICountry,
  currency: ICurrency,
  industry: IIndustry,
  entityTypeId: string,
  countryId: string,
  currencyId: string,
  industryId: string,
}
