
import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/http-service/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';

@Injectable({
  providedIn: 'root'
})
export class MenuMasterService {

  constructor(private apiService: ApiService) { }

  menuMasterList(): Observable<any> {
    let url = API_CONSTANT.menuMasterList
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  
  getMenuMasterById(payload: any): Observable<any> {
    let url = API_CONSTANT.menuMasterById
    return this.apiService
      .get(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  
  createMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.createMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.updateMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   deleteMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.deleteMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
