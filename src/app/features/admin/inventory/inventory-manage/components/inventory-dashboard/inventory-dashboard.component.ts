import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { TransferDeviceDataComponent } from '../transfer-device-data/transfer-device-data.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: false,
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.scss'
})
export class InventoryDashboardComponent {
 manufactureData: any;
  userDetails: any;
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  excelMenuId : any = "All";
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  label: string = 'All';
  searchKeyword: any = '';
  isAllSelected: boolean = false;
  selectedDevices: any[] = [];
  bsModalRef!: BsModalRef;
  selectedRows: any[] = [];
  selectedDevicesForPopup: any[] = [];

  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }

  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  get isUnAllottedView(): boolean {
    return this.label === 'Un Alloted';
  }

  get isAllottedView(): boolean {
    return this.label === 'Alloted';
  }

  constructor(
    private inventoryService: InventoryService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService,


  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    });
  }

  ngOnInit() {
    this.getManufactureDashboardData('All');
    this.setInialTable();
  }

  setInialTable() {
    const baseColumns = [
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
      { key: 'valid_till_date', title: 'Valid Till Date' },
    ];

    if (this.label === 'Un Alloted') {
      this.columns = [
        baseColumns[0],
        { key: 'Select', title: 'Select' },
        ...baseColumns.slice(1)
      ];
    }
    else if (this.label === 'Alloted') {
      this.columns = [
        baseColumns[0],
        { key: 'Select', title: 'Select' },
        ...baseColumns.slice(1),
        { key: 'Action', title: 'Action' }
      ];
    }
    else {
      this.columns = baseColumns;
    }
  }

  onSelectCard(label: any) {
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.excelMenuId = label;
    this.getManufactureDashboardData(label)
  }

  getManufactureDashboardData(label: any) {
    this.label = label;
    this.setInialTable();
    this.isLoading = true;
    let reportType: any = 1
    if (this.label == 'Alloted') {
      reportType = 2
    } else if (this.label == 'Un Alloted') {
      reportType = 3
    }

    let payload = {
      reportTypeId: reportType,
      pageNumber: this.pagesize.offset,
      pageSize: this.pagesize.limit,
      searchTerm: this.searchKeyword,
      maxDevices: 100000,
      manufacturerId: this.userDetails?.RoleId == 6 ? Number(this.userDetails?.Id) : 0,
      distributerId: this.userDetails?.RoleId == 2 ? Number(this.userDetails?.Id) : 0,
      delaerId: this.userDetails?.RoleId == 3 ? Number(this.userDetails?.Id) : 0
    };

    this.inventoryService.inventoryData(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.manufactureData = res?.body?.result?.data || {};
      this.pagesize.count = res?.body?.result?.totalCount || 0;
         this.excelpagecount = res?.body?.result?.totalCount || 0;
      if (this.manufactureData?.deviceViewModel?.length) {
        this.manufactureData.deviceViewModel = this.manufactureData.deviceViewModel.map((d: any) => ({
          ...d,
          selected: false
        }));
      }
      this.selectedRows = [];
      this.selectedDevicesForPopup = [];
    });
  }

   // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(label: any): Promise<any[]> {
      this.isExcelLoading = true;
   this.label = label;
    this.setInialTable();
    let reportType: any = 1
    if (this.label == 'Alloted') {
      reportType = 2
    } else if (this.label == 'Un Alloted') {
      reportType = 3
    }
      let payload = {
      reportTypeId: reportType,
      pageNumber: this.pagesize.offset,
      pageSize: this.excelpagecount,
      searchTerm: this.searchKeyword,
      maxDevices: 100000,
      manufacturerId: this.userDetails?.RoleId == 6 ? Number(this.userDetails?.Id) : 0,
      distributerId: this.userDetails?.RoleId == 2 ? Number(this.userDetails?.Id) : 0,
      delaerId: this.userDetails?.RoleId == 3 ? Number(this.userDetails?.Id) : 0
    };
  
      return new Promise((resolve, reject) => {
      this.inventoryService.inventoryData(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {
              resolve(  res?.body?.result?.data?.deviceViewModel);
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
     
      const data = await this.getAllDataList(this.excelMenuId);
   console.log(data);
      
      if (!data || data.length === 0) {
        console.log('No data for excel');
        return;
      }
  
     const excelData = data.map((item: any, index: number) => ({
    'S.No': index + 1,
    'Device ID': item?.device_id || 'NA',
    'UID': item?.uid || 'NA',
    'IMEI': item?.imei || 'NA',
    'ICCID': item?.iccid || 'NA',
    'Vahan S.No.': item?.vahan_sno || 'NA',
    'Integrator': item?.integrator_name || 'NA',
    'Manufacturer': item?.manufacture_name || 'NA',
    'Distributor': item?.distributor_name || 'NA',
    'Dealer': item?.dealer_name || 'NA',
    'Card State': item?.card_state || 'NA',
    'Card Status': item?.card_status || 'NA',
    'Valid Till Date': item?.valid_till_date
      ? formatDate(item.valid_till_date, 'dd/MM/yyyy', 'en-US')
      : 'NA',
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Device List');
  XLSX.writeFile(wb, 'Inventory_Device_List.xlsx');
    }
  
  
    // ----------------------------end --------------------------------------------------------------
  
  onRowSelectionChange() {
    const allRows = this.manufactureData?.deviceViewModel || [];
    this.selectedRows = allRows.filter((d: any) => d.selected);
    this.selectedDevicesForPopup = this.selectedRows.map((d: any) => ({
      device_id: d.device_id ?? 0,
      uid: d.uid ?? '',
      imei: d.imei ?? '',
      iccid: d.iccid ?? '',
      fk_manufacture_id: d.fk_manufacture_id ?? 0,
      fk_distributor_id: d.fk_distributor_id ?? 0,
      fk_dealer_id: d.fk_dealer_id ?? 0
    }));
    this.isAllSelected =
      allRows.length > 0 && this.selectedRows.length === allRows.length;
  }

  onTransfer() {
    const initialState: ModalOptions = {
      initialState: {
        payloadData: this.selectedDevicesForPopup
      },
    };
    this.bsModalRef = this.modalService.show(
      TransferDeviceDataComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.excelMenuId = this.label;
      this.getManufactureDashboardData(this.label);
    });
  }

    get hasAnySelection(): boolean {
    return this.selectedDevicesForPopup.length > 0;
  }

  onDeleteDevice(item: any) {
    const payloadArray = [this.buildDeletePayload(item)];
    this.openDeleteConfirmation(payloadArray, `Device : ${item?.imei}`);
  }


  onDeleteSelected() {
    if (!this.hasAnySelection) return;
    const payloadArray = this.selectedRows.map((item: any) =>
      this.buildDeletePayload(item)
    );
    this.openDeleteConfirmation(
      payloadArray,
      `Delete ${payloadArray.length} device(s)`
    );
  }


  private buildDeletePayload(item: any) {
    return {
      device_id: Number(item?.device_id),
      fk_manufacture_id: Number(item?.fk_manufacture_id),
      fk_distributor_id: Number(item?.fk_distributor_id),
      fk_dealer_id: Number(item?.fk_dealer_id)
    };
  }

  private openDeleteConfirmation(payloadArray: any[], title: string) {
    const url = this.inventoryService.deleteManufactureDevice(payloadArray);
    const initialState: ModalOptions = {
      initialState: {
        title,
        content: 'Are you sure you want to delete?',
        primaryActionLabel: 'Delete',
        secondaryActionLabel: 'Cancel',
        service: url
      },
    };

    this.bsModalRef = this.modalService.show(
      DeleteConfirmationComponent,
      Object.assign(initialState, {
        id: 'confirmation',
        class: 'modal-md modal-dialog-centered',
      })
    );

    this.bsModalRef?.content.mapdata.subscribe((value: any) => {
      if (value?.status == 200) {
        this.notficationSerivce.successAlert(value?.body?.actionResponse);
        this.pagesize.offset = 1;
        this.pagesize.limit = 25;
          this.excelMenuId = this.label;
        this.getManufactureDashboardData(this.label);
      } else {
        this.notficationSerivce.errorAlert(value?.body?.actionResponse);
      }
    });
  }

//   downloadExcel() {
//   const list = this.manufactureData?.deviceViewModel || [];

//   if (!list.length) {
//     return;
//   }

//   const excelData = list.map((item: any, index: number) => ({
//     'S.No': index + 1,
//     'Device ID': item?.device_id || 'NA',
//     'UID': item?.uid || 'NA',
//     'IMEI': item?.imei || 'NA',
//     'ICCID': item?.iccid || 'NA',
//     'Vahan S.No.': item?.vahan_sno || 'NA',
//     'Integrator': item?.integrator_name || 'NA',
//     'Manufacturer': item?.manufacture_name || 'NA',
//     'Distributor': item?.distributor_name || 'NA',
//     'Dealer': item?.dealer_name || 'NA',
//     'Card State': item?.card_state || 'NA',
//     'Card Status': item?.card_status || 'NA',
//     'Valid Till Date': item?.valid_till_date
//       ? formatDate(item.valid_till_date, 'dd/MM/yyyy', 'en-US')
//       : 'NA',
//   }));

//   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(wb, ws, 'Inventory Device List');
//   XLSX.writeFile(wb, 'Inventory_Device_List.xlsx');
// }


  onSearch(event: any) {
    const searchValue = event.target.value.trim().replace(/\s+/g, ' ');
    this.searchKeyword = searchValue;
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
      this.excelMenuId = this.label;
    this.getManufactureDashboardData(this.label);
  }

  clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
      this.excelMenuId = this.label;
    this.getManufactureDashboardData(this.label);
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
      this.excelMenuId = this.label;
    this.getManufactureDashboardData(this.label);
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
      this.excelMenuId = this.label;
    this.getManufactureDashboardData(this.label);
  }
}
