export interface INotificationsWidgets {
    id: string;
    message: string;
    creationDateTime: Date;
    sender: string;
    shareWith: string;
    entities: string[];
    engagement: string;
    readed: boolean;
}
export interface INotificationSystemGenerting {
    id: string,
    message: string
}

export interface INotificationByProject {
    message: string;
    sender: string;
    projectId: string
}

export interface ITimeZones {
    id: string;
    hasIanaId: boolean;
    displayName: string;
    standardName: string;
    daylightName: string;
    baseUtcOffset: string;
    supportsDaylightSavingTime: boolean;
}

export interface IWarning {
    id: string;
    message: string;
    createdBy: string;
    expirationDate: string;
    dismissable: boolean;
    cancelAutomatically: boolean;
    lockoutNonAdminUsers: boolean;
    timeZone: string;
    active: boolean;
    expirationDateUtc: string;
}

export interface INotificationList {
    CreationDateTime: string;
    Id: string;
    Message: string;
    Readed: boolean;
    Sender: string;
}

export interface IWarningWidget {
    Id: string;
    Message: string;
    CreatedBy: string;
    CreatedDate: string;
    ExpirationDate: string;
    Dismissable: boolean;
    CancelAutomatically: boolean;
    LockoutNonAdminUsers: boolean;
    TimeZone: string;
    Active: boolean;
    ModifiedDate: string;
    ExpirationDateUtc: string;
}
