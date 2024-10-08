import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IRole } from "../../models/role/role-model";
import { HttpService } from "../shared/http/http.service";

@Injectable({
    providedIn: 'root'
})

export class RoleService {

    private uri: string = "Role";
    public items = new BehaviorSubject<IRole[]>([]);
    constructor(private httpService: HttpService){

    }

    getRoleAll(): Observable<IRole[]> {
        return this.httpService.get<IRole[]>(`${this.uri}/Role/all`)
        //return this.httpService.get<IRole[]>('/api/role')
    }
}