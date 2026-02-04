import { Component } from '@angular/core';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DevicePlanService } from '../../services/device-plan.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { CreateDevicePlanComponent } from '../create-device-plan/create-device-plan.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-device-plan-list',
  standalone: false,
  templateUrl: './device-plan-list.component.html',
  styleUrl: './device-plan-list.component.scss',
})
export class DevicePlanListComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  excelMenuId :any;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  devicePlanList: any;
  distributerDropdown: any;
  selectedDestributer: any;
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
  dealerList: any;
  selectedDealer: any;
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
    private devicePlanService: DevicePlanService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue();
    if (this.userDetails.RoleId == 2) {
      this.getDealerDropDown('');
    } else {
      this.getDistributerDropDown();
    }
  }

  setInitialValue() {
    this.columns = [
      { key: 'sno', title: 'S.No.' },
      { key: 'Device Category', title: 'Device Category' },
      { key: 'Device Sub Category', title: 'Device Sub Category' },
      { key: 'Plan Category', title: 'Plan Category' },
      { key: 'Plan Sub Category', title: 'Plan Sub Category' },
      { key: 'Sim Type', title: 'Sim Type' },
      { key: 'Plan Rate', title: 'Plan Rate' },
      { key: 'Start Date', title: 'Start Date' },
      { key: 'End Date', title: 'End Date' },
      { key: 'action', title: 'Action' },
    ];
  }

  getDevicePlanList(data: any) {
    this.isLoading = true;
    let payload = {
      custId: Number(data.value),
    };
    this.devicePlanService.devicePlanList(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess == true) {
        this.devicePlanList = res?.body?.result;
        this.pagesize.count = this.devicePlanList?.length;
        this.excelpagecount = this.devicePlanList?.length || 0;
      }
    });
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(data: any): Promise<any[]> {
      this.isExcelLoading = true;
  
      let payload = {
      custId: Number(data.value),
      pageSize: this.excelpagecount,
    };
  
      return new Promise((resolve, reject) => {
         this.devicePlanService.devicePlanList(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {
              resolve(res.body.result);
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
  
      if (!data || data.length === 0) {
        console.log('No data for excel');
        return;
      }
  
       const excelData = data.map((item: any, index: number) => ({
      'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,
      'Device Category': item?.device_category_name || 'NA',
      'Device Subcategory': item?.device_subcategory_name || 'NA',
      'Plan Category': item?.category_name || 'NA',
      'Plan Sub Category': item?.sub_category_name || 'NA',
      'Sim Type': item?.integrator_name || 'NA',
      'Plan Rate': item?.plan_rate ?? 'NA',
      'Plan Start Date': item?.plan_start_date
        ? formatDate(item.plan_start_date, 'dd-MM-yyyy', 'en-US')
        : 'N/A',
      'Plan End Date': item?.plan_end_date
        ? formatDate(item.plan_end_date, 'dd-MM-yyyy', 'en-US')
        : 'N/A',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Device Plan List');

    // include selected distributor/dealer in filename if available
    const custName =
      this.selectedDealer?.text || this.selectedDestributer?.text || 'All';
    const safeName = (custName || 'All').toString().replace(/\s+/g, '_');
    const filename = `Device_Plan_List_${safeName}.xlsx`;

    XLSX.writeFile(wb, filename);
    }
 
  
    // ----------------------------end --------------------------------------------------------------
  
  getDistributerDropDown() {
    this.isLoading = true;
    let payload = {
      distributorId: Number(this.userDetails?.Id),
    };
    this.commonService.distributerDropdown(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.status == 200) {
        this.distributerDropdown = res?.body;
        this.selectedDestributer = this.distributerDropdown[0];
        this.excelMenuId = this.selectedDestributer;
        this.getDevicePlanList(this.selectedDestributer);
      }
    });
  }

  onSelectDistributer(event: any) {
    this.devicePlanList = [];
    this.selectedDealer = null;
    if (!Array.isArray(event.value)) {
      this.selectedDestributer = event?.value;
      this.excelMenuId = this.selectedDestributer;
      this.getDevicePlanList(this.selectedDestributer);
      this.getDealerDropDown(this.selectedDestributer);
    } else {
      this.selectedDestributer = null;
      this.selectedDealer = null;
    }
  }

  getDealerDropDown(data: any) {
    let distributerId = data ? data?.value : Number(this.userDetails?.Id);
    this.commonService.dealerListDD(distributerId).subscribe((res: any) => {
      this.dealerList = res?.body;
      if (this.userDetails.RoleId == 2) {
        this.selectedDealer = this.dealerList[0];
        this.excelMenuId = this.selectedDealer;
        this.getDevicePlanList(this.selectedDealer);
      }
    });
  }

  onSelectDealer(event: any) {
    this.devicePlanList = [];
    if (!Array.isArray(event.value)) {
      this.selectedDealer = event?.value;
      this.excelMenuId = this.selectedDealer;
      this.getDevicePlanList(this.selectedDealer);
    } else {
      this.selectedDealer = null;
      this.excelMenuId = this.selectedDestributer;
      this.getDevicePlanList(this.selectedDestributer);
    }
  }

  onAddDevicePlan(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
        customerId: this.selectedDealer.value
          ? this.selectedDealer.value
          : this.selectedDestributer.value,
        customerName: this.selectedDealer.value
          ? `Dealer : ${this.selectedDealer.text}`
          : `Distributer : ${this.selectedDestributer.text}`,
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateDevicePlanComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      if (this.selectedDealer.value) {
        this.excelMenuId = this.selectedDealer;
        this.getDevicePlanList(this.selectedDealer);
      } else {
        this.excelMenuId = this.selectedDestributer;
        this.getDevicePlanList(this.selectedDestributer);
      }
    });
  }

  onDeleteDevicePlan(item: any) {
    let payload = {
      pk_plan_id: Number(item?.pk_plan_id),
    };
    let url = this.devicePlanService.deleteDevicePlan(payload);
    const initialState: ModalOptions = {
      initialState: {
        title: `Device Plan  : ${item?.device_subcategory_name}`,
        content: 'Are you sure you want to delete?',
        primaryActionLabel: 'Delete',
        secondaryActionLabel: 'Cancel',
        service: url,
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
         this.excelMenuId = this.selectedDestributer;
        this.getDevicePlanList(this.selectedDestributer);
      } else {
        this.notficationSerivce.errorAlert(value?.body?.actionResponse);
      }
    });
  }

  // downloadExcel() {
  //   const list = this.devicePlanList || [];

  //   if (!list.length) {
  //     return;
  //   }

  //   const excelData = list.map((item: any, index: number) => ({
  //     'S.No': (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,
  //     'Device Category': item?.device_category_name || 'NA',
  //     'Device Subcategory': item?.device_subcategory_name || 'NA',
  //     'Plan Category': item?.category_name || 'NA',
  //     'Plan Sub Category': item?.sub_category_name || 'NA',
  //     'Sim Type': item?.integrator_name || 'NA',
  //     'Plan Rate': item?.plan_rate ?? 'NA',
  //     'Plan Start Date': item?.plan_start_date
  //       ? formatDate(item.plan_start_date, 'dd-MM-yyyy', 'en-US')
  //       : 'N/A',
  //     'Plan End Date': item?.plan_end_date
  //       ? formatDate(item.plan_end_date, 'dd-MM-yyyy', 'en-US')
  //       : 'N/A',
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Device Plan List');

  //   // include selected distributor/dealer in filename if available
  //   const custName =
  //     this.selectedDealer?.text || this.selectedDestributer?.text || 'All';
  //   const safeName = (custName || 'All').toString().replace(/\s+/g, '_');
  //   const filename = `Device_Plan_List_${safeName}.xlsx`;

  //   XLSX.writeFile(wb, filename);
  // }

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
