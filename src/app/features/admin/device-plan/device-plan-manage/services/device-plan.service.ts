import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/http-service/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';

@Injectable({
  providedIn: 'root'
})
export class DevicePlanService {

  constructor(private apiService: ApiService) { }

  devicePlanList(data:any): Observable<any> {
    let url = API_CONSTANT.devicePlanList.replace("{custId}",data.custId)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createDevicePlan(payload: any): Observable<any> {
    let url = API_CONSTANT.createDevicePlan
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateDevicePlan(payload: any): Observable<any> {
    let url = API_CONSTANT.updateDevicePlan
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   deleteDevicePlan(payload: any): Observable<any> {
    let url = API_CONSTANT.deleteDevicePlan
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
