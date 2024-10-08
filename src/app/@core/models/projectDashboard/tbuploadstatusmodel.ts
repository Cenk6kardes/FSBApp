export interface ITBUploadStatus {
    ProjectId: string,
    PeriodBreakName: string,
    ColumnStatus: string[],
    CurrentDate: Date,
    PeriodStartDate: Date,
    PeriodEndDate: Date
}