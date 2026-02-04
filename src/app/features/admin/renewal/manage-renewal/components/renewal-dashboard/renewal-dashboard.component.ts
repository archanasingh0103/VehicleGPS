import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { RenewalService } from '../../../services/renewal.service';
import * as XLSX from 'xlsx';
import { UpdateStatusComponent } from '../update-status/update-status.component';

@Component({
  selector: 'app-renewal-dashboard',
  standalone: false,
  templateUrl: './renewal-dashboard.component.html',
  styleUrl: './renewal-dashboard.component.scss',
})
export class RenewalDashboardComponent {
  manufactureData: any;
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
  label: string = 'Live';
  searchKeyword: any = '';
  isAllSelected: boolean = false;
  selectedDevices: any[] = [];
  bsModalRef!: BsModalRef;
  selectedRows: any[] = [];
  selectedDevicesForPopup: any[] = [];
  simDashboardCount: any;
  simStatus: number = 6;
  maxDevice: any;
  labelColor: string = 'text-green-500';
 dashboardCards =  [
    { 
      id: 1, 
      label: 'Inactive', 
      key: 'inactive', 
      color: 'text-yellow-500', 
      svgPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    },
    { 
      id: 2, 
      label: 'Suspended', 
      key: 'suspended', 
      color: 'text-blue-500', 
      svgPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
    },
    { 
      id: 3, 
      label: 'Terminated', 
      key: 'terminated', 
      color: 'text-red-500', 
      svgPath: 'M6 18L18 6M6 6l12 12'
    },
    { 
      id: 4, 
      label: 'Others', 
      key: 'others', 
      color: 'text-purple-500', 
      svgPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    { 
      id: 5, 
      label: 'Expired Soon', 
      key: 'expiredSoon', 
      color: 'text-orange-500', 
      svgPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    { 
      id: 6, 
      label: 'Live', 
      key: 'live', 
      color: 'text-green-500', 
      svgPath: 'M5 13l4 4L19 7'
    },
    { 
      id: 7, 
      label: 'Expired', 
      key: 'expired', 
      color: 'text-red-600', 
      svgPath: 'M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728'
    },
    { 
      id: 8, 
      label: 'Optional', 
      key: 'optional', 
      color: 'text-green-600', 
      svgPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    { 
      id: 9, 
      label: 'Live (Other)', 
      key: 'liveOther', 
      color: 'text-emerald-600', 
      svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    { 
      id: 10, 
      label: 'All', 
      key: 'allcount', 
      color: 'text-gray-600', 
      svgPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      disabled: true 
    }
  ];

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
    private renewalService: RenewalService,
    private commonService: CommonService,
    private NotificationService: NotificationService,
    private bsModalService: BsModalService
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    });
  }

  ngOnInit() {
    this.setInialTable();
    this.getDashboardCount();
  }

  setInialTable() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'device_id', title: 'Device ID' },
      { key: 'uid', title: 'UID' },
      { key: 'imei', title: 'IMEI' },
      { key: 'iccid', title: 'ICCID' },
      { key: 'vahan_sno', title: 'Vahan S.No.' },
      { key: 'integrator_name', title: 'Integrator' },
      { key: 'manufacture_name', title: 'Manufacturer' },
      { key: 'distributor_name', title: 'Distributor' },
      { key: 'dealer_name', title: 'Dealer' },
      { key: 'card_state', title: 'Card State' },
      { key: 'card_status', title: 'Card Status' },
      { key: 'ticket_id', title: 'Ticket Id' },
      { key: 'ticket_action', title: 'Ticket Action' },
      { key: 'ticket_status', title: 'Ticket Status' },
      { key: 'activated_date', title: 'Activation Date' },
      { key: 'valid_till_date', title: 'Valid Till Date' },
      { key: 'in_days', title: 'Days' },
      { key: 'Action', title: 'Action' },
    ];
  }

  onSelectCard(simStatus: any, label: any, maxDevice: any) {
     if (simStatus === 0) return     
    this.simStatus = simStatus;
    this.maxDevice = maxDevice;
    this.label = label;

    switch (simStatus) {
      case 1:
        this.labelColor = 'text-yellow-500';
        break;
      case 2:
        this.labelColor = 'text-blue-500';
        break;
      case 3:
        this.labelColor = 'text-red-500';
        break;
      case 4:
        this.labelColor = 'text-purple-500';
        break;
      case 5:
        this.labelColor = 'text-orange-500';
        break;
      case 6:
        this.labelColor = 'text-green-500';
        break;
      case 7:
        this.labelColor = 'text-red-600';
        break;
      case 8:
        this.labelColor = 'text-green-600';
        break;
      case 9:
        this.labelColor = 'text-emerald-600';
        break;
      default:
        this.labelColor = 'text-gray-700';
    }

    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getSimStatusList();
  }

  getDashboardCount() {
    this.renewalService.getSimCountDetail().subscribe((res: any) => {
      if (res?.body?.isSuccess == true) {
        this.simDashboardCount = res?.body?.result;
        this.maxDevice = this.simDashboardCount.live;
        this.getSimStatusList();
      }
    });
  }

  getSimStatusList() {
    this.isLoading = true;
    let payload = {
      userId: Number(this.userDetails?.Id),
      pageNumber: this.pagesize.offset,
      pageSize: this.pagesize.limit,
      searchTerm: this.searchKeyword,
      reportTypeId: 0,
      maxDevices: this.maxDevice,
      simStatusType: this.simStatus,
    };

    this.renewalService.getSimList(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.manufactureData = res?.body?.result?.data || {};
      this.pagesize.count = res?.body?.result?.totalCount || 0;
          this.excelpagecount = res?.body?.result?.totalCount || 0;
      if (this.manufactureData?.deviceViewModel?.length) {
        this.manufactureData.deviceViewModel =
          this.manufactureData.deviceViewModel.map((d: any) => ({
            ...d,
            selected: false,
          }));
      }
      this.selectedRows = [];
      this.selectedDevicesForPopup = [];
    });
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(): Promise<any[]> {
      this.isExcelLoading = true;
     let payload = {
      userId: Number(this.userDetails?.Id),
      pageNumber: this.pagesize.offset,
      pageSize: this.excelpagecount,
      searchTerm: this.searchKeyword,
      reportTypeId: 0,
      maxDevices: this.maxDevice,
      simStatusType: this.simStatus,
    };
  
      return new Promise((resolve, reject) => {
        this.renewalService.getSimList(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {              
              resolve(res?.body?.result?.data?.deviceViewModel);
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
  
     const excelData = data?.map((item: any, index: number) => ({
        'S.No': index + 1,
        'Device ID': item?.device_id || 'NA',
        UID: item?.uid || 'NA',
        IMEI: item?.imei || 'NA',
        ICCID: item?.iccid || 'NA',
        'Vahan S.No.': item?.vahan_sno || 'NA',
        Integrator: item?.integrator_name || 'NA',
        Manufacturer: item?.manufacture_name || 'NA',
        Distributor: item?.distributor_name || 'NA',
        Dealer: item?.dealer_name || 'NA',
        'Card State': item?.card_state || 'NA',
        'Card Status': item?.card_status || 'NA',
        'Ticket Id': item?.ticket_id || 'NA',
        'Ticket Action': item?.ticket_action || 'NA',
        'Ticket Status': item?.ticket_status || 'NA',
        'Activation Date': item?.activated_date
          ? formatDate(item.activated_date, 'dd/MM/yyyy', 'en-US')
          : 'NA',
        'Valid Till Date': item?.valid_till_date
          ? formatDate(item.valid_till_date, 'dd/MM/yyyy', 'en-US')
          : 'NA',
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'Sim Status List');
      XLSX.writeFile(wb, 'Sim_Status_List.xlsx');
    }
  
    // ----------------------------end --------------------------------------------------------------
  

  onUpdateStatus(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.bsModalService.show(
      UpdateStatusComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getSimStatusList();
    });
  }

  checkStatus(item: any) {
    this.renewalService.checkStatus(item.ticket_id).subscribe((res: any) => {
      console.log('res Status', res);
      if (res?.body?.isSuccess == true) {
        this.pagesize.offset = 1;
        this.pagesize.limit = 25;
        this.getSimStatusList();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    });
  }

  updateSimDetail(item: any) {
    this.renewalService.updateSim(item.iccid).subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.pagesize.offset = 1;
        this.pagesize.limit = 25;
        this.getSimStatusList();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    });
  }


// downloadExcel() {
//   this.isLoading = true;
//   const payload = {
//     userId: Number(this.userDetails?.Id),
//     pageNumber: 1,
//     pageSize: 100000,
//     searchTerm: this.searchKeyword,
//     reportTypeId: 0,
//     maxDevices: this.maxDevice,
//     simStatusType: this.simStatus,
//   }

//   this.renewalService.getSimList(payload).subscribe({
//     next: (res: any) => {
//       this.isLoading = false;
//       const list = res?.body?.result?.data?.deviceViewModel || [];
//       if (!list.length) {
//         this.NotificationService.errorAlert('No data available');
//         return;
//       }

//       const excelData = list.map((item: any, index: number) => ({
//         'S.No': index + 1,
//         'Device ID': item?.device_id || 'NA',
//         UID: item?.uid || 'NA',
//         IMEI: item?.imei || 'NA',
//         ICCID: item?.iccid || 'NA',
//         'Vahan S.No.': item?.vahan_sno || 'NA',
//         Integrator: item?.integrator_name || 'NA',
//         Manufacturer: item?.manufacture_name || 'NA',
//         Distributor: item?.distributor_name || 'NA',
//         Dealer: item?.dealer_name || 'NA',
//         'Card State': item?.card_state || 'NA',
//         'Card Status': item?.card_status || 'NA',
//         'Ticket Id': item?.ticket_id || 'NA',
//         'Ticket Action': item?.ticket_action || 'NA',
//         'Ticket Status': item?.ticket_status || 'NA',
//         'Activation Date': item?.activated_date
//           ? formatDate(item.activated_date, 'dd/MM/yyyy', 'en-US')
//           : 'NA',
//         'Valid Till Date': item?.valid_till_date
//           ? formatDate(item.valid_till_date, 'dd/MM/yyyy', 'en-US')
//           : 'NA',
//       }));

//       const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//       const wb: XLSX.WorkBook = XLSX.utils.book_new();

//       XLSX.utils.book_append_sheet(wb, ws, 'Sim Status List');
//       XLSX.writeFile(wb, 'Sim_Status_List.xlsx');
//     },
//     error: () => {
//       this.isLoading = false;
//       this.NotificationService.errorAlert('Excel download failed');
//     }
//   });
// }


  onSearch(event: any) {
    const searchValue = event.target.value.trim().replace(/\s+/g, ' ');
    this.searchKeyword = searchValue;
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getSimStatusList();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getSimStatusList();
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
    this.getSimStatusList();
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.pagesize.limit = selectedSize;
    this.getSimStatusList();
  }
}
