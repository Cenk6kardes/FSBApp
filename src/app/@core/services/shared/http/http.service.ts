import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry, catchError, throwError, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from '../toastr/toastr.service';
import { LoggerService } from '../logger/logger.service';
import { GenericResponse } from '../../../models/shared/response.model';
import { UserClaims } from '../../../models/user/user-claims';
import { NbTokenService } from '@nebular/auth';
import { AuthAzureToken } from 'src/app/auth/azure/azure-adb2c-auth-strategy';
import { RoleManagerService } from 'src/app/auth/role-manager.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // Define API
  apiURL = environment.BaseUrl;
  private token: string = '';
  private userId: string = '';
  private httpClient: HttpClient; //to ByPass Interceptors
  constructor(private http: HttpClient,
    private handler: HttpBackend,//to ByPass Interceptors
    private toastr: ToastrService,
    private logger: LoggerService,
    private authService: NbTokenService,
    private roleManager: RoleManagerService
  ) {
    this.httpClient = new HttpClient(handler)
    // this.user = this.getAuthLocalStorage()!; 

    this.authService.get().subscribe(id_token => {
      var tokenPayLoad = id_token as AuthAzureToken;
      this.token = tokenPayLoad.getValue();
    })
    this.roleManager._userId.subscribe(id => { if (id) this.userId = id });
  }

  isAuthorized(): boolean {
    const userAuth: UserClaims = JSON.parse(localStorage.getItem('__userAuth')!);
    if (userAuth) {
      return true
    }
    return false
  }

  getAuthLocalStorage(): UserClaims | null {
    if (this.isAuthorized()) {
      return JSON.parse(localStorage.getItem('__userAuth')!) as UserClaims;
    }
    return null;
  }


  //#region Bypass Interceptors
  getFile<T>(endpoint: string): Observable<any> {
    this.logger.log(`${this.apiURL}${endpoint}`);
    return this.httpClient
      .get(`${this.apiURL}${endpoint}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/vnd.ms-excel',
          'Authorization': `Bearer ${this.token}`,
          'UserGuid': `${this.userId}`
        }),
        responseType: 'arraybuffer'
      })
      .pipe(retry(1), catchError(this.handleError));
  }


  // if (event.type == HttpEventType.UploadProgress) {
  //   this.uploadProgress = Math.round(100 * (event.loaded / event.total));
  // }

  postFiles(endpoint: string, formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.apiURL}${endpoint}`, formData, {
      // reportProgress: true,
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'UserGuid': `${this.userId}`
      }),
      observe: 'response'
    })
      .pipe(retry(1),
        map(httpResponse => {
          let resp = httpResponse.body as GenericResponse<any>;
          if (!(resp.httpStatusCode === HttpStatusCode.Ok)) {
            throw new HttpErrorResponse({
              status: resp.httpStatusCode,
              error: resp.message,
              url: httpResponse.url!,
              headers: httpResponse.headers
            })
          } else if (resp.response) {
            return httpResponse.clone({ body: resp.response })
          }
          return httpResponse
        }),
        catchError(this.handleError));
  }
  //#endregion

  /*========================================
    CRUD Methods for consuming RESTful API
  =========================================*/
  get<T>(endpoint: string): Observable<T> {
    this.logger.log(`${this.apiURL}${endpoint}`);
    return this.http
      .get<T>(`${this.apiURL}${endpoint}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getById<T>(id: any, endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.apiURL}${endpoint}/${id}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  post<T>(entity: any, endpoint: string): Observable<T> {
    return this.http
      .post<T>(`${this.apiURL}${endpoint}`, JSON.stringify(entity))
      .pipe(catchError(this.handleError));
  }

  put<T>(entity: any, endpoint: string): Observable<T> {
    return this.http
      .put<T>(`${this.apiURL}${endpoint}`, JSON.stringify(entity))
      .pipe(catchError(this.handleError));
  }

  patch<T>(entity: any, endpoint: string): Observable<T> {
    return this.http
      .patch<T>(`${this.apiURL}${endpoint}`, JSON.stringify(entity))
      .pipe(retry(1), catchError(this.handleError));
  }

  delete<T>(id: any, endpoint: string) {
    return this.http
      .delete<T>(`${this.apiURL}${endpoint}/${id}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  cancel<T>(endpoint: string) {
    return this.http
      .delete<T>(`${this.apiURL}${endpoint}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  handleError = (error: any) => {
    let errorMessage = '';
    let warning: boolean = false;
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error;
    } else {
      // Get server-side error
      if (error.status === HttpStatusCode.Conflict) warning = true;
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}`;
    }

    const errorM = error.error ? `\nMessage: ${error.error}` : '';
    if (warning) {
      this.toastr.showWarning(`${errorM}`);
      this.logger.warn(`${errorMessage}`);
    }
    else {
      this.toastr.showError(`An error has ocurred, please try again later! ${errorM}`);
      this.logger.error(`${errorMessage}`);
    }

    return throwError(() => {
      return errorMessage;
    });
  }
}

