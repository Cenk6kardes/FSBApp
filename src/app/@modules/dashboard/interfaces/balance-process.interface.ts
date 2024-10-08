export class column {
  id: string | null;
  amount: number | string;
  column: any;
  projectBalanceSheetId?: string;
  projectIncomeStatementId?: string;
}

export class ItemNode {
  accountNumber: any;
  children: ItemNode[];
  id: string;
  isTotal: boolean;
  item: string;
  level: number;
  parentID: string | null;
  columns: column[];
  pyColumns?: column[];
}

export class ItemFlatNode {
  id: string;
  item: string;
  level: number;
  expandable: boolean;
  parentID: string | null;
  isTotal: boolean;
  columns: any;
  pyColumns?: any;
}

export class BalanceSource {
  static ManualEntry = 'Manual Entry';
  static TrialBalanceUpload = 'Trial Balance Upload';
}
export class PeriodBreak {
  static Annually = 'Annual';
  static HalfYearly = 'Half Year';
  static Quarterly = 'Quarterly';
  static Monthly = 'Monthly';
}

export class FormatOptions {
  static GL_Format = 'GL Format';
  static FS_Format = 'FS Format';
}
