import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AdminManufacturerService } from '../../services/admin-manufacturer.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { CreateAdminManufacturerComponent } from '../create-admin-manufacturer/create-admin-manufacturer.component';
import { ManufactureMoreDetailComponent } from './../manufacture-more-detail/manufacture-more-detail.component';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'admin-manufacturer-list',
  standalone: false,
  templateUrl: './admin-manufacturer-list.component.html',
  styleUrl: './admin-manufacturer-list.component.scss'
})
export class AdminManufacturerListComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  manuFacuturerList: any
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any
  isExporting: string = '';
  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private adminManufacturerService: AdminManufacturerService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService,
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit(): void {
    this.setInitialValue();
    this.getManufactureList();
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Organization Name', title: 'Organization Name' },
      { key: 'Contact Person', title: 'Contact Person' },
      { key: 'Email', title: 'Email' },
      { key: 'Mobile', title: 'Mobile' },
      { key: 'GST', title: 'GST' },
      { key: 'PAN', title: 'PAN' },
      { key: 'Image', title: 'Image' },
      { key: 'More Detail', title: 'More Detail' },
      { key: 'Action', title: 'Action' }
    ]
  }

  get visibleColumns() {
    return this.columns.filter((col: any) =>
      !(this.userDetails?.RoleId == '6' && col.title === 'Action')
    );
  }

  getManufactureList() {
    this.isLoading = true;
    let payload = {
      "roleId": Number(this.userDetails?.RoleId),
      "parentId": Number(this.userDetails?.Id)
    }
    this.adminManufacturerService.adminManufacturerList(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.manuFacuturerList = res?.body?.result || [];
      this.pagesize.count = this.manuFacuturerList?.length;
        this.excelpagecount = this.manuFacuturerList?.length || 0;
    })
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------

  getAllDataList(): Promise<any[]> {
    this.isExcelLoading = true;

    let payload = {
      "roleId": Number(this.userDetails?.RoleId),
      "parentId": Number(this.userDetails?.Id),
        pageSize: this.excelpagecount,
    }

    return new Promise((resolve, reject) => {
       this.adminManufacturerService.adminManufacturerList(payload).subscribe({
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
    console.log("excel working.....");
    
    const data = await this.getAllDataList();

    if (!data || data.length === 0) {
      console.log('No data for excel');
      return;
    }

    const excelData = data.map((item: any, index: number) => ({
    'S.No': index + 1,
    'Organization Name': item?.orgName || 'NA',
    'Contact Person': item?.contactPersonName || 'NA',
    'Email': item?.email || 'NA',
    'Mobile': item?.mobileNo || 'NA',
    'GST': item?.gstNo || 'NA',
    'PAN': item?.panNo || 'NA',
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Manufacturer List');
  XLSX.writeFile(wb, 'Manufacturer_List.xlsx');
  }

  // ----------------------------end --------------------------------------------------------------

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }

  onAddManufacture(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : ''
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateAdminManufacturerComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getManufactureList()
    });
  }

  showDetails(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        moreDetaildata: data
      },
    };
    this.bsModalRef = this.modalService.show(
      ManufactureMoreDetailComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
  }

   onDeleteManufacture(item: any) {
      let payload = {
        "empId": Number(item?.empId)
      }
      let url = this.adminManufacturerService.deleteManufacture(payload)
      const initialState: ModalOptions = {
        initialState: {
          title:`Manufacturer  : ${item?.contactPersonName}` ,
          content: 'Are you sure you want to delete?',
          primaryActionLabel: 'Delete',
          secondaryActionLabel: 'Cancel',
          service: url
        },
      };
      this.bsModalRef = this.modalService.show(
        DeleteConfirmationComponent,
        Object.assign(initialState, {
          id: "confirmation",
          class: "modal-md modal-dialog-centered",
        })
      );
      this.bsModalRef?.content.mapdata.subscribe(
        (value: any) => {
          if (value?.status == 200) {
            this.notficationSerivce.successAlert(value?.body?.actionResponse);
            this.pagesize.offset = 1;
            this.pagesize.limit = 25;
            this.getManufactureList();
          } else {
            this.notficationSerivce.errorAlert(value?.body?.actionResponse);
          }
        }
      );
    }

//     downloadExcel() {
//   if (!this.manuFacuturerList || this.manuFacuturerList.length === 0) {
//     return;
//   }

//   const excelData = this.manuFacuturerList.map((item: any, index: number) => ({
//     'S.No': index + 1,
//     'Organization Name': item?.orgName || 'NA',
//     'Contact Person': item?.contactPersonName || 'NA',
//     'Email': item?.email || 'NA',
//     'Mobile': item?.mobileNo || 'NA',
//     'GST': item?.gstNo || 'NA',
//     'PAN': item?.panNo || 'NA',
//   }));

//   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(wb, ws, 'Manufacturer List');
//   XLSX.writeFile(wb, 'Manufacturer_List.xlsx');
// }

exportManufactureToPDF() {
  this.isExporting = 'PDF';

  const headers = [
    'S No',
    'Organization Name',
    'Contact Person',
    'Email',
    'Mobile',
    'GST',
    'PAN'
  ];

  const rows = this.manuFacuturerList?.map((item: any, index: number) => [
    (this.pagesize.offset - 1) * this.pagesize.limit + index + 1,
    item?.orgName || 'NA',
    item?.contactPersonName || 'NA',
    item?.email || 'NA',
    item?.mobileNo || 'NA',
    item?.gstNo || 'NA',
    item?.panNo || 'NA'
  ]) || [];

  this.commonService.exportToPDF(headers, rows, 'Manufacturer Report');
  this.isExporting = '';
}

  
}
