import { Injectable } from "@angular/core";
import { CoaType, FSBConstants, TabType } from "src/app/shared/Infrastructure/constants/constants";
import { HttpService } from 'src/app/@core/services/shared/http/http.service';

@Injectable()
export class BalanceSheetTreeService {
    constructor(private httpService: HttpService) {       

    }

    public getProjectFsStructuring(projectId: string, tabType: number){
        let url = "";
        if (tabType == TabType.ProjectBalanceSheet){
            url = FSBConstants.webApis.FsStructuring.getProjectBalanceSheet.replace('{0}',projectId.toString())
        }
        else if (tabType == TabType.ProjectIncomeStatement) {
            url = FSBConstants.webApis.FsStructuring.getProjectIncomeStatement.replace('{0}',projectId.toString())
        }
        return this.httpService.get<any>(url);
    }

    public saveProjectFsStructuring(params: any, tabType: number){
        let url = "";
        if (tabType == TabType.ProjectBalanceSheet){
            url = FSBConstants.webApis.FsStructuring.saveProjectBalanceSheet;
        }
        else if (tabType == TabType.ProjectIncomeStatement) {
            url = FSBConstants.webApis.FsStructuring.saveProjectIncomeStatement;
        }
        return this.httpService.post<any>(params, url);
    }

    public getBalanceSheet(COAID: string, coaType: number) {
        let url = "";
        if (coaType == CoaType.Engagement){
            url = FSBConstants.webApis.EngagementCOE.getBalanceSheet.replace('{0}',COAID.toString())
        }
        else if (coaType == CoaType.Global){
            url = FSBConstants.webApis.GlobalCOE.getBalanceSheet.replace('{0}',COAID.toString())
        }
        return this.httpService.get<any>(url);
    };


    public saveBalanceSheet(params: any, coaType: number) {
        let url = "";
        if (coaType == CoaType.Engagement){
            url = FSBConstants.webApis.EngagementCOE.saveBalanceSheet;
        }
        else if (coaType == CoaType.Global){
            url = FSBConstants.webApis.GlobalCOE.saveBalanceSheet;
        }
        return this.httpService.post<any>(params, url);
    }

    public saveIncomeStatement(params:any, coaType:number) {
        let url = "";
        if (coaType == CoaType.Engagement){
            url = FSBConstants.webApis.EngagementCOE.saveIncomeStatement;
        }
        else if (coaType == CoaType.Global){
            url = FSBConstants.webApis.GlobalCOE.saveIncomeStatement;
        }
        return this.httpService.post<any>(params, url);
    }

    public getIncomeStatement(COAID: string, coaType: number) {
        let url = "";
        if (coaType == CoaType.Engagement){
            url = FSBConstants.webApis.EngagementCOE.getIncomeStatement.replace('{0}',COAID.toString())
        }
        else if (coaType == CoaType.Global){
            url = FSBConstants.webApis.GlobalCOE.getIncomeStatement.replace('{0}',COAID.toString())
        }
        return this.httpService.get<any>(url);
    }

    getBalanceSheetTreeStructure(projectId: string) {
        let url = FSBConstants.webApis.FsStructuring.downloadProjectBalanceSheetTreeStructuring.replace('{0}',projectId.toString());
        return this.httpService.getFile<any>(url)
      }

    uploadBalanceSheetTreeStructure(formData: FormData, projectId: string) {
        let url = FSBConstants.webApis.FsStructuring.uploadProjectBalanceSheetTreeStructuring.replace('{0}',projectId.toString());
        return this.httpService.postFiles(url, formData)
      }

      getIncomeStatementTreeStructure(projectId: string) {
        let url = FSBConstants.webApis.FsStructuring.downloadProjectIncomeStatementTreeStructuring.replace('{0}',projectId.toString());
        return this.httpService.getFile<any>(url)
      }

    uploadIncomeStatementTreeStructure(formData: FormData, projectId: string) {
        let url = FSBConstants.webApis.FsStructuring.uploadProjectIncomeStatementTreeStructuring.replace('{0}',projectId.toString());
        return this.httpService.postFiles(url, formData)
      }
}
