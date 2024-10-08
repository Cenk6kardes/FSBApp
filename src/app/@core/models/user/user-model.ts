import { IEntity } from "../entityScreen/entityScreenModel.interface";
import { IRole } from "../role/role-model";
import { IGenericEntity } from "../shared/entity-model";

export interface IUserModel extends IGenericEntity{
    userName: string
    email: string,
    role: IRole,
    listEntity: IGenericEntity[],
    notifications: boolean
}

export interface IUserModelRequest extends IGenericEntity{
    email: string,
    roleID: string,
    listEntity: string[],
    notifications: boolean
}

export interface IUserToggle {
    id: string,
    notificationStatus: boolean
}