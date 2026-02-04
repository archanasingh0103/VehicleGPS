import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/http-service/api.service';
import { API_CONSTANT } from '../../../shared/constant/API.Constant';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RenewalService {

   constructor(private apiService: ApiService) { }

  generateSimRequest(payload: any): Observable<any> {
    let url = API_CONSTANT.generateSimRequest
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   checkStatus(reqId:any): Observable<any> {
    let url = API_CONSTANT.checkStatus.replace('{req_id}', reqId)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateSim(deviceIccid:any): Observable<any> {
    let url = API_CONSTANT.updateSimDetail.replace('{deviceIccid}', deviceIccid)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   getSimCountDetail(): Observable<any> {
    let url = API_CONSTANT.simDashboardCount;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getSimList(payload: any): Observable<any> {
    let url = API_CONSTANT.simDashboardList;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   getplanCatByIccid(iccid:any): Observable<any> {
    let url = API_CONSTANT.planCatByIccid.replace('{iccid}', iccid)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

}
