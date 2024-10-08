import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IRole } from "../../models/role/role-model";
import { IUserModel, IUserModelRequest } from "../../models/user/user-model";
import { HttpService } from "../shared/http/http.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private uri = 'Users/User';

    public items = new BehaviorSubject<IUserModel[]>([]);

    constructor(private httpService: HttpService){
    }

    patch(id: string): Observable<boolean> {
        return this.httpService.patch<boolean>(id,this.uri);
    }

    post(item: IUserModelRequest[]): Observable<[]> {
        return this.httpService.post<[]>(item, this.uri)
      }
    

    update(item: IUserModelRequest): Observable<boolean> {
        return this.httpService.put<boolean>(item, this.uri)
    }

    delete(id: string) {
        return this.httpService.delete<boolean>(id, this.uri);
    }

    getList(): Observable<IUserModel[]> {
        return this.httpService.get<IUserModel[]>(`${this.uri}/all`);
    }

    getUserRoles(): Observable<IRole[]> {
        return this.httpService.get<IRole[]>(`${this.uri}/Roles`);
    }
}