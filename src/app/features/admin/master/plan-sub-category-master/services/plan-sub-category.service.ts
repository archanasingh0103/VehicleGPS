import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/http-service/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONSTANT } from '../../../../shared/constant/API.Constant';

@Injectable({
  providedIn: 'root'
})
export class PlanSubCategoryService {

  constructor(private apiService: ApiService) { }

  planSubCategoryList(data: any): Observable<any> {
    // let url = API_CONSTANT.planSubCategoryList
    let url = API_CONSTANT.planSubCategoryById.replace("{categoryId}", data?.categoryId).replace("{subcategoryId}", data?.subcategoryId)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createPlanSubCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.createPlanSubCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updatePlanSubCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.updatePlanSubCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  deletePlanSubCategory(payload: any): Observable<any> {
    let url = API_CONSTANT.deletePlanSubCategory
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
