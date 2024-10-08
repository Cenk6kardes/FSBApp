import { IGenericEntity } from '../entity-model';
export interface ICountry extends IGenericEntity{
    code: string,
}
export interface ICurrency extends IGenericEntity{
    code: string,
}
export interface IEntityType extends IGenericEntity{}
export interface IIndustry extends IGenericEntity{}
export interface IPeriodBreak extends IGenericEntity{
    code: string,
}
export interface ICoaType extends IGenericEntity{
    code: string,
}
export interface IProjectType extends IGenericEntity{
    code: string,
}
