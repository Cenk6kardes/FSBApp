export interface IMyActivities {
  activity: IMyActivity[];
  loading: boolean;
  pageToLoadNext: number;
}

export interface IMyActivity {
  id: number;
  date: string | Date;
  header: string;
  description: string;
  status: string | number;
}
