import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';
import { ApiService } from '../../../../shared/http-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PlanCategoryService {

 
  constructor(private apiService: ApiService) { }

  planCategoryList(): Observable<any> {
    let url = API_CONSTANT.planCategoryList
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createPlanCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.createPlanCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updatePlanCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.updatePlanCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

   deletePlanCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.deletePlanCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
