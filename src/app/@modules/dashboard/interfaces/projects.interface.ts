
export interface IProjectTable {
  id: string;
  name: string;
  entitityEngagement: string;
  fy: string;
  startEndDate: string;
  status: string;
  lastProcessed: string;
  dueTbFs: string | null;
  dueTb: string;
  dueFs: string;
  overdue: boolean;
}


export interface IProjects {
  id: string;
  name: string;
  entity: IEntity;
  financialYear: number;
  periodStartDate: string;
  periodEndDate: string;
  periodBreak: IPeriodBreak;
  projectType: IProjectType;
  coaType: ICoaType;
  globalCoa: string;
  engagementCoa: string;
  uploadDueDate: string;
  reviewDueDate: string;
  status: string;
  overdue: boolean;
  lastProcessed: string;
  balanceSource:string;
}

export interface IEntity {
  id: string;
  name: string;
  active: boolean;
  deleted: boolean;
}

export interface IPeriodBreak {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface IProjectType {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface ICoaType {
  id: string;
  name: string;
  code: string;
  active: boolean;
}
