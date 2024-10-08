export interface INotes {
  note: INote[];
  loading: boolean;
  pageToLoadNext: number;
}

export interface INote {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdDate: string;
  isGlobal: boolean;
}
