import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';
import { ApiService } from '../../../../shared/http-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private apiService: ApiService) { }

   inventoryData(payload: any): Observable<any> {
    let url = API_CONSTANT.manufactureDashboard
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  transferDevice(payload: any): Observable<any> {
    let url = API_CONSTANT.transferDevice
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   transferManualDevice(data:any,payload: any): Observable<any> {
    let url = API_CONSTANT.transferManualDevice.replace("{parentId}",data?.parentId).replace("{childId}",data?.childId)
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  deleteManufactureDevice(payload: any): Observable<any> {
    let url = API_CONSTANT.deleteManufactureDevice
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
