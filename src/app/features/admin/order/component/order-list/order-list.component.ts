import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonService } from '../../../../shared/services/common.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { PlaceOrderRequestComponent } from '../place-order-request/place-order-request.component';
import { Router } from '@angular/router';
import { VahanDeviceDropdownComponent } from '../vahan-device-dropdown/vahan-device-dropdown.component';
import { OrderStatusChangeComponent } from '../order-status-change/order-status-change.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {
  orderDashData: any;
  userDetails: any;
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  label: string = 'Pending'
  statusType: any = 1;
  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  } 
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private orderService: OrderService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private cd: ChangeDetectorRef,
    private router: Router,
     private NotificationService: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    })
  }

  ngOnInit() {
    this.getOrderDashboardData();
    this.setInialTable()
  }

  setInialTable() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Order Status', title: 'Order Status' },
      { key: 'Order Date', title: 'Order Date' },
      { key: 'Order By', title: 'Order By' },
      { key: 'Product', title: 'Product' },
      // { key: 'Plan', title: 'Plan' },
      // { key: 'State', title: 'State' },
      { key: 'Quantity', title: 'Quantity' },
      { key: 'Payment Mode', title: 'Payment Mode' },
      { key: 'Payment Status', title: 'Payment Status' },
      { key: 'Verify Status', title: 'Verify Status' },
      { key: 'Verify Date', title: 'Verify Date' },
      { key: 'Remark', title: 'Remark' },
      { key: 'Action', title: 'Action' }
    ]
  }


  getOrderDashboardData() {
    this.isLoading = true;
    let payload = {
      "request_by": Number(this.userDetails?.Id),
      "status_id": this.statusType
    }
    this.orderService.orderDashboard(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.orderDashData = res?.body?.result || {};
      this.pagesize.count = this.orderDashData?.requestList?.length || 0;
        this.excelpagecount = this.orderDashData?.requestList?.length  || 0;
    })
  }

  // --------------- ayushi start 28/01/2026 ----------------------------------------------

  getAllDataList(): Promise<any[]> {
    this.isExcelLoading = true;

 let payload = {
      "request_by": Number(this.userDetails?.Id),
      "status_id": this.statusType,
        pageSize: this.excelpagecount,
    }

    return new Promise((resolve, reject) => {
        this.orderService.orderDashboard(payload).subscribe({
        next: (res: any) => {
          this.isExcelLoading = false;
          if (res?.body?.isSuccess) {
            resolve(res.body.result.requestList);
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
console.log(data);

     const excelData = data.map((item: any, index: number) => ({
    'S.No': index + 1,
    'Order Status': item?.status_Name || 'NA',
    'Order Date': item?.created_date
      ? formatDate(item.created_date, 'dd/MM/yyyy', 'en-US')
      : '',
    'Order By': item?.party_name || 'NA',
    'Product': item?.subCategoryName || 'NA',
    'Receive Qty': item?.receive_qty ?? 0,
    'Request Qty': item?.request_qty ?? 0,
    'Payment Mode': item?.payment_mode || 'NA',
    'Payment Status': item?.payment_status || 'NA',
    'Verify Status': item?.varify_status_Name || 'NA',
    'Verify Date': item?.verify_date
      ? formatDate(item.verify_date, 'dd/MM/yyyy', 'en-US')
      : '',
    'Remark': item?.remarks || 'NA',
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Order List');
  XLSX.writeFile(wb, 'Order_List.xlsx');
  }



  // ----------------------------end --------------------------------------------------------------


  calculatePercentage(value: number): number {
    if (!value) return 0;
    const total = this.orderDashData?.pending + this.orderDashData?.processing +
      this.orderDashData?.dispatched + this.orderDashData?.rejected;
    return Math.round((value / total) * 100);
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }

  onPlaceOrder() {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      PlaceOrderRequestComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getOrderDashboardData()
    });
  }

  onShowOrder(label: any, statusType: any) {
    this.label = label;
    this.statusType = statusType;
    this.orderDashData = {
      requestList: [],
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
    this.getOrderDashboardData();
  }

  generateInvoice(item: any) {
    if (!item?.pk_request_id) {
      console.error('Missing request ID', item);
      return;
    }
    this.router.navigate(
      ['/admin/orders/order-details', item.pk_request_id, item.created_by]);
  }

  onOrderIssue(item: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: item,
        type: 'Order'
      },
    };
    this.bsModalRef = this.modalService.show(
      VahanDeviceDropdownComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getOrderDashboardData()
    });

  }

  orderHistory(item: any) {
    if (!item?.pk_request_id) {
      console.error('Missing request ID', item);
      return;
    }

    this.router.navigate(
      ['/admin/orders/order-history', item.pk_request_id, item.created_by]);
  }

  onChangeStatus(item: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: item,
      },
    };
    this.bsModalRef = this.modalService.show(
      OrderStatusChangeComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getOrderDashboardData()
    });
  }

  paymentHistory(item: any) {
    if (!item?.pk_request_id) {
      console.error('Missing request ID', item);
      return;
    }

    this.router.navigate(
      ['/admin/orders/payment-history', item.pk_request_id, item.created_by]);
  }
//   downloadExcel() {
//   const list = this.orderDashData?.requestList || [];

//   if (!list.length) {
//     return;
//   }

//   const excelData = list.map((item: any, index: number) => ({
//     'S.No': index + 1,
//     'Order Status': item?.status_Name || 'NA',
//     'Order Date': item?.created_date
//       ? formatDate(item.created_date, 'dd/MM/yyyy', 'en-US')
//       : '',
//     'Order By': item?.party_name || 'NA',
//     'Product': item?.subCategoryName || 'NA',
//     'Receive Qty': item?.receive_qty ?? 0,
//     'Request Qty': item?.request_qty ?? 0,
//     'Payment Mode': item?.payment_mode || 'NA',
//     'Payment Status': item?.payment_status || 'NA',
//     'Verify Status': item?.varify_status_Name || 'NA',
//     'Verify Date': item?.verify_date
//       ? formatDate(item.verify_date, 'dd/MM/yyyy', 'en-US')
//       : '',
//     'Remark': item?.remarks || 'NA',
//   }));

//   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(wb, ws, 'Order List');
//   XLSX.writeFile(wb, 'Order_List.xlsx');
// }

}
