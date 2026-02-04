import { Component, NgZone } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommonService } from '../../services/common.service';
import { WalletServiceService } from '../../services/wallet/wallet-service.service';
import { NotificationService } from '../../services/notification.service';
import { AddMoneyWalletComponent } from '../add-money-wallet/add-money-wallet.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-wallet-ledger-page',
  standalone: false,
  templateUrl: './wallet-ledger-page.component.html',
  styleUrl: './wallet-ledger-page.component.scss',
})
export class WalletLedgerPageComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  walletLedgerList: any;
  get startValue(): number {
    return (
      this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1)
    );
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService,
    private walletService: WalletServiceService,
    private location: Location
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue()
    this.getWalletLedgerList();
  }

setInitialValue() {
  this.columns = [
    { key: 'sno', title: 'S.No.' },
    { key: 'wallet_holder_name', title: 'Wallet Holder' },
    { key: 'transaction_time', title: 'Transaction Date' },
    { key: 'transaction_type', title: 'Type' },
    { key: 'amount', title: 'Amount' },
    { key: 'description', title: 'Description' },
    { key: 'post_by', title: 'Posted By' },
    { key: 'transaction_status', title: 'Status' },
  ];
}



  getWalletLedgerList() {
    this.isLoading = true;
    this.walletService.getWalletLedger().subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess == true) {
        this.walletLedgerList = res?.body?.result?.wallet_transaction;
        this.pagesize.count = this.walletLedgerList?.length;
      }
    });
  }

  onAddMoney(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      AddMoneyWalletComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getWalletLedgerList()
    });
  }

    goBack() {
    this.location.back();
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.pagesize.limit = selectedSize;
  }
}
