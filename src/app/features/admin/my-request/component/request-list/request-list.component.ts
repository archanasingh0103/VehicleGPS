import { Component } from '@angular/core';
import { CommonService } from '../../../../shared/services/common.service';
import { MyRequestService } from '../../services/my-request.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AddRequestComponent } from '../add-request/add-request.component';
import { RequestInvoiceGenerateComponent } from '../request-invoice-generate/request-invoice-generate.component';
import { RequestPaymentComponent } from '../request-payment/request-payment.component';
import { ChangeRequestStatusComponent } from '../change-request-status/change-request-status.component';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-request-list',
  standalone: false,
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss'
})
export class RequestListComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  myRequestData: any;
  userDetails: any;
  label: string = 'Pending';
  statusType: any = 1;
  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  };
  columns: any;

  constructor(
    private commonService: CommonService,
    private myRequestService: MyRequestService,
    private modalService: BsModalService,
    private router: Router,
     private NotificationService: NotificationService

  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    })
  };

  ngOnInit() {
    this.setInialTable();
    this.getMyRequestData();
  }

  setInialTable() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Request Status', title: 'Request Status' },
      { key: 'Request On', title: 'Request On' },
      { key: 'Request By', title: 'Request By' },
      { key: "Service", title: "Service" },
      { key: 'Invoice Status', title: 'Invoice Status' },
      { key: 'Invoice Date', title: 'Invoice Date' },
      { key: 'Payment Status', title: 'Payment Status' },
      { key: 'Payment Date', title: 'Payment Date' },
      { key: 'Verify Status', title: 'Verify Status' },
      { key: 'Verify Date', title: 'Verify Date' },
      { key: 'Refrence No.', title: 'Refrence No.' },
      { key: 'Action', title: 'Action' },
    ]
  }

  getMyRequestData() {
    this.isLoading = true;
    let payload = {
      "client_id": Number(this.userDetails.Id),
      "status_id": this.statusType
    }
    this.myRequestService.myReuesetData(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.myRequestData = res?.body?.result || {};
      this.pagesize.count = res?.body?.result?.serviceList?.length || 0;
        this.excelpagecount = res?.body?.result?.serviceList?.length  || 0;
    })
  }

   // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(): Promise<any[]> {
      this.isExcelLoading = true;
  
   let payload = {
      "client_id": Number(this.userDetails.Id),
      "status_id": this.statusType,
       pageSize: this.excelpagecount,
    }
  
      return new Promise((resolve, reject) => {
        this.myRequestService.myReuesetData(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            console.log(res?.body);
            
            if (res?.body?.isSuccess) {
              resolve(res?.body?.result?.serviceList || []);
            } else {
              resolve([]);
            }
          },
          error: err => {
            this.isExcelLoading = false;
            reject(err);
          }
        });
      });
    }
  
    async downloadExcel() {
      const data = await this.getAllDataList();
  
      if (!data || data.length === 0) {
        console.log('No data for excel');
        return;
      }
  
      const excelData = data.map((item: any, index: number) => ({
      'S.No': index + 1,
      'Request Status': item?.request_status || 'NA',
      'Request On': item?.created_date
        ? formatDate(item.created_date, 'dd/MM/yyyy', 'en-US')
        : 'NA',
      'Request By': item?.party_name || 'NA',
      'Service': item?.service_name || 'NA',
      'Invoice Status': item?.isInvoiceGenerated == 1 ? 'Yes' : 'No',
      'Invoice Date': item?.invoice_date
        ? formatDate(item.invoice_date, 'dd/MM/yyyy', 'en-US')
        : 'NA',
      'Payment Status': item?.payment_status || 'NA',
      'Payment Date': item?.payment_date
        ? formatDate(item.payment_date, 'dd/MM/yyyy', 'en-US')
        : 'NA',
      'Verify Status': item?.varify_status_Name || 'NA',
      'Verify Date': item?.verify_date
        ? formatDate(item.verify_date, 'dd/MM/yyyy', 'en-US')
        : 'NA',
      'Reference No.': item?.tally_refrence_no || 'NA',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'My Service Requests');
    XLSX.writeFile(wb, 'My_Service_Requests.xlsx');
    }
  
  
    // ----------------------------end --------------------------------------------------------------
  
  calculatePercentage(value: number): number {
    if (!value) return 0;
    const total = this.myRequestData?.pending + this.myRequestData?.processing +
      this.myRequestData?.dispatched + this.myRequestData?.rejected;
    return Math.round((value / total) * 100);
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }

  onShowOrder(label: any, statusType: any) {
    this.label = label;
    this.statusType = statusType;
    this.myRequestData = {
      serviceList: [],
      pending: 0,
      processing: 0,
      dispatched: 0,
      rejected: 0
    };
    this.pagesize = {
      limit: 25,
      offset: 1,
      count: 0
    };
    this.getMyRequestData();
  }

  bsModalRef!: BsModalRef
  onRequestGenerate(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      AddRequestComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyRequestData()
    });
  }

  invoiceGenerate(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      RequestInvoiceGenerateComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyRequestData()
    });
  }

  onPayment(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      RequestPaymentComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyRequestData()
    });
  }

  onChangeSericeStatus(item: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: item,
      },
    };
    this.bsModalRef = this.modalService.show(
      ChangeRequestStatusComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyRequestData()
    });
  }

  orderRequestHistory(item: any) {
    if (!item?.pk_device_request_id) {
      console.error('Missing request ID', item);
      return;
    }

    this.router.navigate(
      ['/admin/request/order-request-history', item.pk_device_request_id, item.created_by]);
  }

  paymentRequestHistory(item: any) {
    console.log(item);
    if (!item?.pk_device_request_id) {
      console.error('Missing request ID', item);
      return;
    }

    this.router.navigate(
      ['/admin/request/payment-request-history', item.pk_device_request_id, item.created_by]);
  }

  // downloadExcel() {
  //   const list = this.myRequestData?.serviceList || [];

  //   if (!list.length) {
  //     return;
  //   }

  //   const excelData = list.map((item: any, index: number) => ({
  //     'S.No': index + 1,
  //     'Request Status': item?.request_status || 'NA',
  //     'Request On': item?.created_date
  //       ? formatDate(item.created_date, 'dd/MM/yyyy', 'en-US')
  //       : 'NA',
  //     'Request By': item?.party_name || 'NA',
  //     'Service': item?.service_name || 'NA',
  //     'Invoice Status': item?.isInvoiceGenerated == 1 ? 'Yes' : 'No',
  //     'Invoice Date': item?.invoice_date
  //       ? formatDate(item.invoice_date, 'dd/MM/yyyy', 'en-US')
  //       : 'NA',
  //     'Payment Status': item?.payment_status || 'NA',
  //     'Payment Date': item?.payment_date
  //       ? formatDate(item.payment_date, 'dd/MM/yyyy', 'en-US')
  //       : 'NA',
  //     'Verify Status': item?.varify_status_Name || 'NA',
  //     'Verify Date': item?.verify_date
  //       ? formatDate(item.verify_date, 'dd/MM/yyyy', 'en-US')
  //       : 'NA',
  //     'Reference No.': item?.tally_refrence_no || 'NA',
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(wb, ws, 'My Service Requests');
  //   XLSX.writeFile(wb, 'My_Service_Requests.xlsx');
  // }

}
