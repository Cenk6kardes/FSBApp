import { BalanceSource } from './../../../@modules/dashboard/interfaces/balance-process.interface';
import { TabType } from 'src/app/shared/Infrastructure/constants/constants';
import { HttpService } from 'src/app/@core/services/shared/http/http.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceProcessingService {
  constructor(private httpService: HttpService) {}
  public apiIncome = 'dashboard/ProjectIncomeStatement';
  public apiBalance = 'dashboard/ProjectBalanceSheet';
  public amounts = '/amounts';
  public apiProject = 'dashboard/Project';

  public changeSub = new Subject<TabType>();

  getIncomeSheet(id: string) {
    return this.httpService.getById<any>(id, this.apiIncome);
  }
  getBalanceSheet(id: string) {
    return this.httpService.getById<any>(id, this.apiBalance);
  }

  getIncomeAmounts(id) {
    return this.httpService.getById<any>(id, this.apiIncome + this.amounts);
  }

  getBalanceAmounts(id) {
    return this.httpService.getById<any>(id, this.apiBalance + this.amounts);
  }
  getIncomePyAmounts(id) {
    return this.httpService.getById<any>(
      id,
      this.apiIncome + this.amounts + '/priorYear'
    );
  }
  getBalancePyAmounts(id) {
    return this.httpService.getById<any>(
      id,
      this.apiBalance + this.amounts + '/priorYear'
    );
  }

  saveBalanceSheet(balances) {
    return this.httpService.post<any>(balances, this.apiBalance + this.amounts);
  }

  saveIncomeSheet(incomes) {
    return this.httpService.post<any>(incomes, this.apiIncome + this.amounts);
  }

  deleteBalanceSheet(id) {
    return this.httpService.delete(id, this.apiBalance + this.amounts);
  }

  deleteIncomeSheet(id) {
    return this.httpService.delete(id, this.apiIncome + this.amounts);
  }

  downloadBalanceSheet(id: string, glFormat: boolean) {
    return this.httpService.getFile(
      `${this.apiBalance}${this.amounts}/download/${id}?onlyAccounts=${glFormat}`
    );
  }
  downloadIncomeSheet(id: string, glFormat: boolean) {
    return this.httpService.getFile(
      `${this.apiIncome}${this.amounts}/download/${id}?onlyAccounts=${glFormat}`
    );
  }

  uploadIncomeStatementTreeStructure(
    formData: FormData,
    id: string,
    glFormat: boolean
  ) {
    return this.httpService.postFiles(
      `${this.apiIncome}${this.amounts}/upload/${id}?onlyAccounts=${glFormat}`,
      formData
    );
  }
  uploadBalanceSheetTreeStructure(
    formData: FormData,
    id: string,
    glFormat: boolean
  ) {
    return this.httpService.postFiles(
      `${this.apiBalance}${this.amounts}/upload/${id}?onlyAccounts=${glFormat}`,
      formData
    );
  }

  updateBalanceSource(id: string, bs: BalanceSource) {
    return this.httpService.put(
      { id: id, balanceSource: bs },
      `${this.apiProject}/updatebalancesource`
    );
  }
}
