import { Injectable } from '@angular/core';
import { RoleConstants } from '../shared/Infrastructure/Constants/role-constants';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { UserClaims } from '../@core/models/user/user-claims';
import { HttpService } from '../@core/services/shared/http/http.service';
import { NbAclService } from '@nebular/security';
import { FSBConstants } from '../shared/Infrastructure/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class RoleManagerService { // DELETE

  // public globalAdminId = 'A6D32476-5D11-4971-AB97-AABA03A9B309';
  public _role: BehaviorSubject<string> = new BehaviorSubject(FSBConstants.emptyGuid);
  public _userId: BehaviorSubject<string> = new BehaviorSubject(FSBConstants.emptyGuid);
  public userClaims: Subject<UserClaims>;
  constructor(
    private acl: NbAclService) {
    this.acl.setAccessControl(RoleConstants.rolePermission)
    this.userClaims = new Subject<UserClaims>();
  }

  setRoleDemo(role: string) {

    // const sysAdminId = '46925DAC-7225-49E3-A80A-EEE77C37D4E1';
    // const reviewerId = 'C6F83FE7-0F7D-407F-B709-F43DF3E93B7E';
    // const preparerId = '98ae614b-9e62-496e-b40c-ea29451923b4';

    // switch (role) {
    //   case 'Global Admin':
    //     // this._userId.next(this.globalAdminId);
    //     this._role.next(RoleConstants.roleNames.globalAdmin);
    //     break;
    //   case 'System Admin':
    //     this._userId.next(sysAdminId);
    //     this._role.next(RoleConstants.roleNames.sysAdmin);
    //     break;
    //   case 'Reviewer':
    //     this._userId.next(reviewerId);
    //     this._role.next(RoleConstants.roleNames.reviewer);
    //     break;
    //   case 'Preparer':
    //     this._userId.next(preparerId);
    //     this._role.next(RoleConstants.roleNames.preparer);
    //     break;
    // }
  }
  
  saveAuthLocalStorage(claims: UserClaims) {
    localStorage.setItem('__userAuth', JSON.stringify(claims));
    this._userId.next(claims.userId);
    this._role.next(RoleConstants.roleNames[claims.role]);
    this.userClaims.next(claims);
  }

  isAuthorized(): Observable<boolean> {
    const userAuth: UserClaims = JSON.parse(localStorage.getItem('__userAuth')!);

    if (userAuth.token && userAuth.userId && userAuth.role) {
      this._userId.next(userAuth.userId);
      this._role.next(RoleConstants.roleNames[userAuth.role]);
      return of(true)
    }
    return of(false)
  }

  getAuthLocalStorage(): UserClaims | null {
    if (this.isAuthorized()) {
      return JSON.parse(localStorage.getItem('__userAuth')!) as UserClaims;
    }
    return null;
  }
}