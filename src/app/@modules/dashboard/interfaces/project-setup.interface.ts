export interface IProjectSetup {
    id: string|null;
    entityId: string;
    financialYear: number;
    name: string;
    periodStartDate: string;
    periodEndDate: string;
    periodBreakId: string;
    projectTypeId: string;
    coaTypeId: string;
    globalCoaId: string|null;
    engagementCoaId: string|null;
    uploadDueDate: string;
    reviewDueDate: string;
    status: string;
}