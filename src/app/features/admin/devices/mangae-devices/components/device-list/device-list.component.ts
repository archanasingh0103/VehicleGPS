import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { DeviceService } from '../../services/device.service';
import { CreateDeviceComponent } from '../create-device/create-device.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-device-list',
  standalone: false,
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.scss',
})
export class DeviceListComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  deviceList: any;
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  manuFacuturerList: any;
  selectedManufacture: any;
  selectedDealer: any;
  config = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'Select Manufacture',
  };

  config1 = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'All Distributer',
  };

  config2 = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'All Dealer',
  };
  dealerList: any;
  selectedDistributer: any;
  distributerList: any;
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
    private modalService: BsModalService,
    private NotificationService: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue();
    this.getManufactureList();
    // this.getDealerDropDown()
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
      { key: 'Sim Detail', title: 'Modify Sim Detail' },
    ];
  }

  getManufactureList() {
    this.isLoading = true;
    this.commonService
      .manufactureListDD(this.userDetails?.Id)
      .subscribe((res: any) => {
        this.isLoading = false;
        this.manuFacuturerList = res?.body;
        if (this.userDetails?.RoleId == '6') {
          this.selectedManufacture = this.manuFacuturerList[0];
          this.getDeviceList();
          this.getDistributerList(this.selectedManufacture);
        }
      });
  }

  onSelectManufacture(event: any) {
    this.deviceList = [];
    if (!Array.isArray(event.value)) {
      this.selectedManufacture = event?.value;
      this.getDistributerList(this.selectedManufacture);
      this.getDeviceList();
    } else {
      this.selectedManufacture = null;
      this.selectedDistributer = null;
      this.selectedDealer = null;
    }
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
  }

  getDistributerList(data: any) {
    let manufactureId = data?.value;
    this.commonService
      .distributerListDD(manufactureId)
      .subscribe((res: any) => {
        this.distributerList = res?.body;
      });
  }

  onSelectdistributer(event: any) {
    this.deviceList = [];
    this.selectedDealer = null;
    if (!Array.isArray(event.value)) {
      this.selectedDistributer = event?.value;
      this.getDealerDropDown(this.selectedDistributer);
    } else {
      this.selectedDistributer = null;
      this.selectedDealer = null;
    }
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDeviceList();
  }

  getDealerDropDown(data: any) {
    let distributerId = data?.value;
    this.commonService.dealerListDD(distributerId).subscribe((res: any) => {
      this.dealerList = res?.body;
    });
  }

  onSelectDealer(event: any) {
    this.deviceList = [];
    if (!Array.isArray(event.value)) {
      this.selectedDealer = event?.value;
    } else {
      this.selectedDealer = null;
    }
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDeviceList();
  }
  
  getDeviceList() {
    this.deviceList = [];
    this.pagesize.count = 0;
    this.isLoading = true;
    let payload = {
      manufacturerId: Number(this.selectedManufacture?.value),
      distributerId: this.selectedDistributer?.value
        ? Number(this.selectedDistributer?.value)
        : 0,
      delaerId: this.selectedDealer?.value
        ? Number(this.selectedDealer?.value)
        : 0,
      pageNumber: this.pagesize.offset,
      pageSize: this.pagesize.limit,
      searchTerm: this.searchKeyword,
      maxDevices: 0,
    };
    this.deviceService.getDeviceByUserId(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess == true) {
        this.deviceList = res?.body?.result?.data || [];
        this.pagesize.count = res?.body?.result?.totalCount || 0;
        this.excelpagecount = res?.body?.result?.totalCount || 0;
      }
    });
  }

  // --------------- ayushi start 28/01/2026 ----------------------------------------------

  getDeviceAllDataList(): Promise<any[]> {
    this.isExcelLoading = true;

    const payload = {
      manufacturerId: Number(this.selectedManufacture?.value),
      distributerId: this.selectedDistributer?.value
        ? Number(this.selectedDistributer?.value)
        : 0,
      delaerId: this.selectedDealer?.value
        ? Number(this.selectedDealer?.value)
        : 0,
      pageSize: this.excelpagecount,
      searchTerm: this.searchKeyword,
      maxDevices: 0,
    };

    return new Promise((resolve, reject) => {
      this.deviceService.getDeviceByUserId(payload).subscribe({
        next: (res: any) => {
          this.isExcelLoading = false;
          if (res?.body?.isSuccess) {
            resolve(res.body.result.data);
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
    const data = await this.getDeviceAllDataList();

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

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Device List');
    XLSX.writeFile(wb, 'Device_List.xlsx');
  }

  // ----------------------------end --------------------------------------------------------------

  getDeviceModify(data: any) {
    this.isLoading = true;
    let payload = {
      iccid: data?.iccid,
    };
    this.deviceService.modifiyDevice(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess === true) {
        this.NotificationService.successAlert(res?.body?.actionResponse);
        this.getDeviceList();
      } else {
        this.NotificationService.errorAlert(
          res?.body?.actionResponse || 'Data Not Updated'
        );
      }
    });
  }

  onAdddevice(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        manufacture: this.selectedManufacture,
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateDeviceComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getDeviceList();
    });
  }

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

  onSearch(event: any) {
    const searchValue = event.target.value.trim().replace(/\s+/g, ' ');
    this.searchKeyword = searchValue;
    this.deviceList = [];
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDeviceList();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDeviceList();
  }
}
