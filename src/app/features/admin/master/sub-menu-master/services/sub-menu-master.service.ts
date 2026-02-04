import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/http-service/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';

@Injectable({
  providedIn: 'root'
})
export class SubMenuMasterService {
  constructor(private apiService: ApiService) { }

  subMenuMasterList(): Observable<any> {
    let url = API_CONSTANT.subMenuMasterList
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  
  getSubMenuMasterById(payload: any): Observable<any> {
    let url = API_CONSTANT.subMenuMasterById
    return this.apiService
      .get(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  
  createSubMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.createSubMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateSubMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.updateSubMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   deleteSubMenuMaster(payload: any): Observable<any> {
    let url = API_CONSTANT.deleteSubMenuMaster
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
