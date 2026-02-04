import { Injectable } from '@angular/core';
import { ApiService } from '../../http-service/api.service';
import { API_CONSTANT } from '../../constant/API.Constant';
import { catchError, Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WalletServiceService {
  constructor(private apiService: ApiService) {}

  getUserWallet() {
    let url = API_CONSTANT.walletUserList;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createWallet(payload: any): Observable<any> {
    let url = API_CONSTANT.createUserWallet;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  addMoney(payload: any): Observable<any> {
    let url = API_CONSTANT.addMoney;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getWalletLedger() {
    let url = API_CONSTANT.walletLedgerList;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
