import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import * as XLSX from 'xlsx';

import { ReportService } from '../../services/report.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-activation-report',
  standalone: false,
  templateUrl: './activation-report.component.html',
  styleUrl: './activation-report.component.scss',
})
export class ActivationReportComponent implements OnInit {
  isLoading = false;
   isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  userDetails: any;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  label: any;
  dashboardCount: any;

  get startValue(): number {
    return (
      this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1)
    );
  }

  get lastValue(): number {
    return Math.min(
      this.startValue + this.pagesize.limit - 1,
      this.pagesize.count,
    );
  }
  filterValue = [
    { value: 'ALL', text: 'All' },
    { value: 'APPROVED', text: 'Approved' },
    { value: 'PENDING', text: 'Pending' },
    { value: 'REJECTED', text: 'Rejected' },
  ];
  columns: any[] = [];
  activationList: any;
  distributerDropdown: any[] = [];
  dealerList: any;
  searchKeyword = '';
  activationForm!: FormGroup;
  config = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'Select Distributer',
  };

  config2 = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'Select Dealer',
  };

  config3 = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'Select Filter',
  };

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private commonService: CommonService,
      private NotificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setInitialForm();
    this.setInitialValue();
    this.commonService.getUserDetails().subscribe((user) => {
      this.userDetails = user;
      if (this.userDetails?.RoleId == '1' || this.userDetails?.RoleId == '6') {
        this.getActivationList();
        this.getDistributerDropDown();
      } else {
        this.getActivationList();
      }
    });
  }

  setInitialForm() {
    this.activationForm = this.fb.group({
      distributor: [null],
      dealer: [null],
      userId: [null],
      fromDate: [this.getFirstDateOfCurrentMonth()],
      toDate: [this.getTodayDate()],
      filter: [''],
    });
  }

  private getFirstDateOfCurrentMonth(): string {
    const today = new Date();
    return formatDate(
      new Date(today.getFullYear(), today.getMonth(), 1),
      'yyyy-MM-dd',
      'en-US',
    );
  }

  private getTodayDate(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  setInitialValue() {
    this.columns = [
      { key: 'sno', title: 'S.No.' },
      { key: 'created_at', title: 'Created Date' },
      { key: 'iccid', title: 'ICCID' },
      { key: 'category_name', title: 'Category' },
      { key: 'sub_category_name', title: 'Sub Category' },
      { key: 'action', title: 'Action' },
      { key: 'firstName', title: 'Name' },
      { key: 'roleName', title: 'Role' },
      { key: 'request_amount', title: 'Request Amount' },
      { key: 'total_tax', title: 'Tax' },
      { key: 'net_amount', title: 'Net Amount' },
      { key: 'taisys_resultObj_r_status', title: 'Status' },
    ];
  }

  getDistributerDropDown() {
    this.isLoading = true;
    const payload = {
      distributorId: Number(this.userDetails?.Id),
    };
    this.commonService.distributerDropdown(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.status === 200) {
        this.distributerDropdown = res.body || [];
      }
    });
  }

  onSelectDistributer(event: any) {
    if (!Array.isArray(event.value)) {
      this.activationForm.patchValue({
        distributor: event.value,
        dealer: null,
        userId: event.value.value,
      });

      this.activationList = [];
      this.pagesize.offset = 1;
      this.resetListAndCount();
      this.getDealerDropDown(event.value);
    } else {
      this.activationForm.patchValue({
        distributor: null,
        dealer: null,
        userId: null,
      });
      this.dealerList = [];
      this.getActivationList();
    }
  }

  getDealerDropDown(data: any) {
    const distributerId = data ? data.value : Number(this.userDetails?.Id);
    this.commonService.dealerListDD(distributerId).subscribe((res: any) => {
      this.dealerList = res?.body || [];
    });
  }

  onSelectDealer(event: any) {
    if (!Array.isArray(event.value)) {
      this.activationForm.patchValue({
        dealer: event.value,
        userId: event.value.value,
      });

      this.activationList = [];
      this.resetListAndCount();
      this.pagesize.offset = 1;
    } else {
      this.activationForm.patchValue({
        dealer: null,
        userId: this.activationForm.value.distributor.value,
      });
      this.getActivationList();
    }
  }

  onSelectCard(label: any) {
    this.label = label;
    this.getActivationList();
  }

  getActivationList() {
    this.isLoading = true;
    const fromDate =
      this.activationForm.value.fromDate || this.getFirstDateOfCurrentMonth();
    const toDate = this.activationForm.value.toDate || this.getTodayDate();
    const payload = {
      user_id: this.activationForm.value.userId
        ? Number(this.activationForm.value.userId)
        : 0,
      from_date: formatDate(fromDate, 'yyyy-MM-dd', 'en-US'),
      to_date: formatDate(toDate, 'yyyy-MM-dd', 'en-US'),
      report_filter: this.activationForm.value.filter.value
    };

    this.reportService.getActivationReport(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess == true) {
        this.dashboardCount = res.body.result;
        this.activationList = res.body.result?.activationLists || [];
        this.pagesize.count = this.activationList.length || 0;
         this.excelpagecount = this.activationList.length || 0;
      } else {
        this.resetListAndCount();
      }
    });
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(): Promise<any[]> {
      this.isExcelLoading = true;
  
      const fromDate =
      this.activationForm.value.fromDate || this.getFirstDateOfCurrentMonth();
    const toDate = this.activationForm.value.toDate || this.getTodayDate();
    const payload = {
      user_id: this.activationForm.value.userId
        ? Number(this.activationForm.value.userId)
        : 0,
      from_date: formatDate(fromDate, 'yyyy-MM-dd', 'en-US'),
      to_date: formatDate(toDate, 'yyyy-MM-dd', 'en-US'),
      report_filter: this.activationForm.value.filter.value,
      pageSize: this.excelpagecount,
    };
  
      return new Promise((resolve, reject) => {
        this.reportService.getActivationReport(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {
              resolve(res.body.result?.activationLists);
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
    'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,

    'Created Date': item?.created_at
      ? formatDate(item.created_at, 'dd/MM/yyyy', 'en-US')
      : 'NA',

    'ICCID': item?.iccid || 'NA',

    'Category': item?.category_name || 'NA',

    'Sub Category': item?.sub_category_name || 'NA',

    'Action': item?.action || 'NA',

    'User Name': item?.firstName || 'NA',

    'Role': item?.roleName || 'NA',

    'Request Amount': Number(item?.request_amount ?? 0).toFixed(2),

    'Tax': Number(item?.total_tax ?? 0).toFixed(2),

    'Net Amount': Number(item?.net_amount ?? 0).toFixed(2),

    'Status': item?.taisys_resultObj_r_status || 'NA',
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Activation Report');

  XLSX.writeFile(wb, 'Activation_Report.xlsx');
    }
  

    // ----------------------------end --------------------------------------------------------------
  

  onSelectFilter(event: any) {
    this.activationList = [];
        this.getActivationList();

  }

  private resetListAndCount(): void {
    this.activationList = [];
    this.pagesize.count = 0;
    this.dashboardCount = {
      all: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };
  }

  onSearch(event: any) {
    this.searchKeyword = event.target.value.trim().replace(/\s+/g, ' ');
    this.pagesize.offset = 1;
    // this.getActivationList();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    // this.getActivationList();
  }

  onTablePageChange(page: number) {
    this.pagesize.offset = page;
  }

  onPageSizeChange(event: Event) {
    this.pagesize.limit = +(event.target as HTMLSelectElement).value;
    this.pagesize.offset = 1;
  }

// downloadExcel() {
//   if (!this.activationList || !this.activationList.length) return;

//   const excelData = this.activationList.map((item: any, index: number) => ({
//     'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,

//     'Created Date': item?.created_at
//       ? formatDate(item.created_at, 'dd/MM/yyyy', 'en-US')
//       : 'NA',

//     'ICCID': item?.iccid || 'NA',

//     'Category': item?.category_name || 'NA',

//     'Sub Category': item?.sub_category_name || 'NA',

//     'Action': item?.action || 'NA',

//     'User Name': item?.firstName || 'NA',

//     'Role': item?.roleName || 'NA',

//     'Request Amount': Number(item?.request_amount ?? 0).toFixed(2),

//     'Tax': Number(item?.total_tax ?? 0).toFixed(2),

//     'Net Amount': Number(item?.net_amount ?? 0).toFixed(2),

//     'Status': item?.taisys_resultObj_r_status || 'NA',
//   }));

//   const ws = XLSX.utils.json_to_sheet(excelData);
//   ws['!cols'] = [
//     { wch: 6 },
//     { wch: 14 },
//     { wch: 22 },
//     { wch: 18 },
//     { wch: 20 },
//     { wch: 14 },
//     { wch: 18 },
//     { wch: 14 },
//     { wch: 16 },
//     { wch: 12 },
//     { wch: 14 },
//     { wch: 12 },
//   ];

//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Activation Report');

//   XLSX.writeFile(wb, 'Activation_Report.xlsx');
// }

}
