import { HttpStatusCode } from "@angular/common/http";

export interface GenericResponse<T> {
    response: T;
    httpStatusCode: HttpStatusCode;
    message: string;
}