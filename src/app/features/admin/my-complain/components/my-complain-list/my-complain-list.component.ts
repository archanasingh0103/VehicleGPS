import { Component } from '@angular/core';
import { MycomplainService } from '../../services/mycomplain.service';
import { CommonService } from '../../../../shared/services/common.service';
import { GenerateComplainComponent } from '../generate-complain/generate-complain.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AssignComplainComponent } from '../assign-complain/assign-complain.component';
import { ResponseComplainComponent } from '../response-complain/response-complain.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-my-complain-list',
  standalone: false,
  templateUrl: './my-complain-list.component.html',
  styleUrl: './my-complain-list.component.scss'
})
export class MyComplainListComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  myComplainData: any;
  userDetails: any;
  label: string = 'Open';
  statusType: any = 1;
  bsModalRef!: BsModalRef
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
    private myComplainService: MycomplainService,
    private modalService: BsModalService,
      private NotificationService: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    })
  };

  ngOnInit() {
    this.setInialTable();
    this.getMyComplainData();
  }

  setInialTable() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Complain Status', title: 'Complain Status' },
      { key: 'Created On', title: 'Created On' },
      { key: 'Created By', title: 'Created By' },
      { key: 'Category Name', title: 'Category Name' },
      { key: "Refrence Name", title: "Refrence Name" },
      { key: "Refrence Value", title: "Refrence Value" },
      { key: "Priority", title: "Priority" },
      { key: 'Last Update Date', title: 'Updated Date' },
      { key: 'Remark', title: 'Remark' },
      { key: 'Action', title: 'Action' },
    ]
  }

  getMyComplainData() {
    this.isLoading = true;
    let service: any
    let payload = {
      "request_by": Number(this.userDetails.Id),
      "status_id": this.statusType
    }
    if (this.userDetails?.RoleId == 7) {
      service = this.myComplainService.userComplainList(payload)
    } else {
      service = this.myComplainService.myComplainData(payload)
    }
    service.subscribe((res: any) => {
      this.isLoading = false;
      this.myComplainData = res?.body?.result || {};
      this.pagesize.count = res?.body?.result?.complaintList?.length || 0;
      this.excelpagecount = res?.body?.result?.complaintList?.length || 0;
    })
  }

   // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(): Promise<any[]> {
      this.isExcelLoading = true;
       let service: any
    let payload = {
      "request_by": Number(this.userDetails.Id),
      "status_id": this.statusType,
        pageSize: this.excelpagecount,
    }
     if (this.userDetails?.RoleId == 7) {
      service = this.myComplainService.userComplainList(payload)
    } else {
      service = this.myComplainService.myComplainData(payload)
    }
      return new Promise((resolve, reject) => {
       service.subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {
              resolve(res?.body?.result?.complaintList);
            } else {
              resolve([]);
            }
          },
          error: (err: any) => {
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
    'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,
    'Complain Status': item?.is_closed === 0 ? 'Open' : item?.is_closed === 1 ? 'Close' : 'NA',
    'Created On': item?.complaint_datetime ? formatDate(item.complaint_datetime, 'dd/MM/yyyy', 'en-US') : 'NA',
    'Created By': item?.client_name || 'NA',
    'Category': item?.complaint_category_name || 'NA',
    'Reference Name': item?.ref_name || 'NA',
    'Reference Value': item?.ref_value || 'NA',
    'Priority': item?.complaint_priority_name || 'NA',
    'Last Updated': item?.last_updated_date ? formatDate(item.last_updated_date, 'dd/MM/yyyy', 'en-US') : 'NA',
    'Remark': item?.complaint_description || 'NA',
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'My Complaints');

  const filename = `My_Complaints_${formatDate(new Date(), 'yyyyMMdd_HHmm', 'en-US')}.xlsx`;
  XLSX.writeFile(wb, filename);
    }
  
  
    // ----------------------------end --------------------------------------------------------------
  
  calculatePercentage(value: number): number {
    if (!value) return 0;
    const total = this.myComplainData?.pending + this.myComplainData?.processing +
      this.myComplainData?.dispatched + this.myComplainData?.rejected;
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
    this.myComplainData = {
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
    this.getMyComplainData();
  }

  onComplainGenerate(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      GenerateComplainComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyComplainData()
    });
  }

  assignComplain(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      AssignComplainComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyComplainData()
    });
  }

  responseComplain(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      ResponseComplainComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getMyComplainData()
    });
  }

//   downloadExcel() {
//   const list = this.myComplainData?.complaintList || [];

//   if (!list.length) {
//     return;
//   }

//   const excelData = list.map((item: any, index: number) => ({
//     'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,
//     'Complain Status': item?.is_closed === 0 ? 'Open' : item?.is_closed === 1 ? 'Close' : 'NA',
//     'Created On': item?.complaint_datetime ? formatDate(item.complaint_datetime, 'dd/MM/yyyy', 'en-US') : 'NA',
//     'Created By': item?.client_name || 'NA',
//     'Category': item?.complaint_category_name || 'NA',
//     'Reference Name': item?.ref_name || 'NA',
//     'Reference Value': item?.ref_value || 'NA',
//     'Priority': item?.complaint_priority_name || 'NA',
//     'Last Updated': item?.last_updated_date ? formatDate(item.last_updated_date, 'dd/MM/yyyy', 'en-US') : 'NA',
//     'Remark': item?.complaint_description || 'NA',
//   }));

//   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'My Complaints');

//   const filename = `My_Complaints_${formatDate(new Date(), 'yyyyMMdd_HHmm', 'en-US')}.xlsx`;
//   XLSX.writeFile(wb, filename);
// }

}
