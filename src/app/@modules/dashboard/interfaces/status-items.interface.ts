export interface IStatusItems {
  header?: string;
  contents: IStatusContent[];
  type?: string;
  overdue?: number;
}

export interface IStatusContent {
  text: string;
  count: number;
  percent: number;
}
