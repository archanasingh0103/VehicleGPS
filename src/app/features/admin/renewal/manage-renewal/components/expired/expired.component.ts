import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { CommonService } from '../../../../../shared/services/common.service';
import { DeviceService } from '../../../../devices/mangae-devices/services/device.service';
import * as XLSX from 'xlsx';
import { InventoryService } from '../../../../inventory/inventory-manage/services/inventory.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-expired',
  standalone: false,
  templateUrl: './expired.component.html',
  styleUrl: './expired.component.scss',
})
export class ExpiredComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  deviceList: any;
  public columns!: any;
  userDetails: any;
  get startValue(): number {
    return (
      this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1)
    );
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }
  searchKeyword: string = '';

  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private inventoryService: InventoryService,
      private NotificationService: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue();
    this.getDeviceList();
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Uid', title: 'UID' },
      { key: 'Imei', title: 'IMEI' },
      { key: 'Iccid', title: 'ICCID' },
      { key: 'Vahan Sno', title: 'Vahan Sno' },
      { key: 'Integrator', title: 'Integrator' },
      { key: 'P. TSP', title: 'P. TSP' },
      { key: 'P. SIM No', title: 'P. SIM No' },
      { key: 'S. TSP', title: 'S. TSP' },
      { key: 'S. SIM No', title: 'S. SIM No' },
      { key: 'Card State', title: 'Card State' },
      { key: 'Card Status', title: 'Card Status' },
      { key: 'Duration', title: 'Duration' },
      { key: 'Activation Date', title: 'Activation Date' },
      { key: 'Valid Till', title: 'Valid Till' },
    ];
  }

  // getDeviceList() {
  //   this.deviceList = []
  //   this.pagesize.count = 0
  //   this.isLoading = true;
  //   let payload = {
  //     "manufacturerId": Number(this.userDetails.Id),
  //     "devicetypeId": 0,
  //     "pageNumber": this.pagesize.offset,
  //     "pageSize": this.pagesize.limit,
  //     "searchTerm": this.searchKeyword,
  //     "maxDevices": 0,
  //     "delaerId": 0
  //   }
  //   this.deviceService.deviceListV2(payload).subscribe((res: any) => {
  //     this.isLoading = false
  //     if (res?.body?.isSuccess == true) {
  //       this.deviceList = res?.body?.result?.data || []
  //       this.pagesize.count = res?.body?.result?.totalCount || 0
  //     }
  //   })
  // }

  getDeviceList() {
    this.isLoading = true;
    let reportType: any = 1;

    let payload = {
      reportTypeId: reportType,
      pageNumber: this.pagesize.offset,
      pageSize: this.pagesize.limit,
      searchTerm: this.searchKeyword,
      maxDevices: 100000,
      manufacturerId:
        this.userDetails?.RoleId == 6 ? Number(this.userDetails?.Id) : 0,
      distributerId:
        this.userDetails?.RoleId == 2 ? Number(this.userDetails?.Id) : 0,
      delaerId:
        this.userDetails?.RoleId == 3 ? Number(this.userDetails?.Id) : 0,
    };

    this.inventoryService.inventoryData(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.deviceList = res?.body?.result?.data?.deviceViewModel || {};
      this.pagesize.count = res?.body?.result?.totalCount || 0;
       this.excelpagecount = res?.body?.result?.totalCount || 0;
    });
  }

  // --------------- ayushi start 28/01/2026 ----------------------------------------------

  getAllDataList(): Promise<any[]> {
    this.isExcelLoading = true;
     let reportType: any = 1;

    let payload = {
      reportTypeId: reportType,
      pageNumber: this.pagesize.offset,
      pageSize: this.excelpagecount,
      searchTerm: this.searchKeyword,
      maxDevices: 100000,
      manufacturerId:
        this.userDetails?.RoleId == 6 ? Number(this.userDetails?.Id) : 0,
      distributerId:
        this.userDetails?.RoleId == 2 ? Number(this.userDetails?.Id) : 0,
      delaerId:
        this.userDetails?.RoleId == 3 ? Number(this.userDetails?.Id) : 0,
    };


    return new Promise((resolve, reject) => {
    this.inventoryService.inventoryData(payload).subscribe({
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
      const excelData = data.map((item: any, index: number) => ({
      'S.No': index + 1,
      Uid: item.uid,
      Imei: item.imei,
      Iccid: item.iccid,
      'Vahan S.No.': item.vahan_sno,
      Integrator: item.integrator_name,
      'P. TSP': item.first_tsp,
      'P. Sim No.': item.first_sim,
      'S. TSP': item.second_tsp,
      'S. Sim No.': item.second_sim,
      'Card State': item.card_state,
      'Card Status': item.card_status,
      Duration: item.sim_duration,
      'Activation Date': formatDate(item.activated_date, 'yyyy-MM-dd', 'en-US'),
      'Valid Till': formatDate(item.valid_till_date, 'yyyy-MM-dd', 'en-US'),
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Device List');
    XLSX.writeFile(wb, 'Device_List.xlsx');
  }


  // ----------------------------end --------------------------------------------------------------


  // downloadExcel() {
  //   if (!this.deviceList || this.deviceList.length === 0) {
  //     return;
  //   }

  //   const excelData = this.deviceList.map((item: any, index: number) => ({
  //     'S.No': index + 1,
  //     Uid: item.uid,
  //     Imei: item.imei,
  //     Iccid: item.iccid,
  //     'Vahan S.No.': item.vahan_sno,
  //     Integrator: item.integrator_name,
  //     'P. TSP': item.first_tsp,
  //     'P. Sim No.': item.first_sim,
  //     'S. TSP': item.second_tsp,
  //     'S. Sim No.': item.second_sim,
  //     'Card State': item.card_state,
  //     'Card Status': item.card_status,
  //     Duration: item.sim_duration,
  //     'Activation Date': formatDate(item.activated_date, 'yyyy-MM-dd', 'en-US'),
  //     'Valid Till': formatDate(item.valid_till_date, 'yyyy-MM-dd', 'en-US'),
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Device List');
  //   XLSX.writeFile(wb, 'Device_List.xlsx');
  // }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
    this.getDeviceList();
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.pagesize.limit = selectedSize;
    this.getDeviceList();
  }
}
