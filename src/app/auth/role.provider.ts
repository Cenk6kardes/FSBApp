import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { NbRoleProvider } from '@nebular/security';
import { RoleManagerService } from './role-manager.service';
import { RoleConstants } from '../shared/Infrastructure/Constants/role-constants';
@Injectable({
    providedIn: 'root'
})
export class RoleProvider implements NbRoleProvider {

    constructor(/*private authService: NbAuthService,*/ private roleManager: RoleManagerService) {
    }

    getRole(): Observable<string> {
        return this.roleManager._role
        // return of(RoleConstants.roleNames.globalAdmin);
        // return this.authService.onTokenChange()
        //     .pipe(
        //         map((token: NbAuthJWTToken) => {
        //             return token.isValid() ? token.getPayload()['role'] : 'guest';
        //         }),
        //     );
    }
}