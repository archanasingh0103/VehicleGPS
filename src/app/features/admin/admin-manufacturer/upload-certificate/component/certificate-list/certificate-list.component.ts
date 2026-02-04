import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { CertificateService } from '../../services/certificate.service';
import { UploadCertificateComponent } from '../upload-certificate/upload-certificate.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-certificate-list',
  standalone: false,
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss'
})
export class CertificateListComponent {
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
  excelMenuId :any;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  certificateList: any
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any
  manuFactDrop: any;
  selectManu: any;
  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }
  config = {
    displayKey: "text",
    height: '200px',
    search: true,
    placeholder: `Select Manufacturer`,
  }

  constructor(
    private commonService: CommonService,
    private certificateService: CertificateService,
    private modalService: BsModalService,
     private NotificationService: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.getManufacturerList();
    this.setInitialValue();
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Manufacture Name', title: 'Manufacture Name' },
      { key: 'Product Name', title: 'Product Name' },
      { key: 'Issue Authority', title: 'Issue Authority' },
      { key: 'Certificate 1', title: 'Certificate 1' },
      { key: 'From date', title: 'From date' },
      { key: 'To Date', title: 'To Date' },
      { key: 'Certificate 2', title: 'Certificate 2' },
      { key: 'From date', title: 'From date' },
      { key: 'To Date', title: 'To Date' },
      { key: 'Created Date', title: 'Created Date' },
      { key: 'Action', title: 'Action' }
    ]
  }

  getManufacturerList() {
    let payload = {
      "roleId": Number(this.userDetails?.RoleId),
      "parentId": Number(this.userDetails?.Id)
    }
    this.commonService.manufacturerList(payload).subscribe((res: any) => {
      this.manuFactDrop = res?.body?.result || [];
      this.manuFactDrop = this.manuFactDrop?.map((item: any) => ({
        value: item.empId,
        text: item.contactPersonName
      }));
      if (this.manuFactDrop?.length > 0) {
        this.selectManu = this.manuFactDrop[0];
        this.excelMenuId = this.manuFactDrop[0].value
        this.getCertificateList(this.manuFactDrop[0].value);
      }
    })
  }

  onChangeManufacturer(event: any) {
    if(event?.value?.value) {
      this.selectManu = event?.value;
      this.certificateList = [];
      this.excelMenuId = event?.value?.value;
      this.getCertificateList(event?.value?.value)
    } else {
      this.selectManu = null;
      this.certificateList = [];
    }

  }

  getCertificateList(manuId: any) {
    this.isLoading = true;
    let payload = {
      "manufacturerId": Number(manuId)
    }
    this.certificateService.certificateList(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.certificateList = res?.body?.result || [];
      this.pagesize.count = this.certificateList?.length;
         this.excelpagecount = this.certificateList?.length || 0;
    })
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(manuId: any): Promise<any[]> {
      this.isExcelLoading = true;
  
     let payload = {
      "manufacturerId": Number(manuId),
        pageSize: this.excelpagecount
    }
  
      return new Promise((resolve, reject) => {
         this.certificateService.certificateList(payload).subscribe({
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
    'S.No': index + 1,
    'Manufacturer Name': item?.pk_emp_name || 'NA',
    'Product Name': item?.pk_product_name || 'NA',
    'Issue Authority': item?.pk_issueby_name || 'NA',
    // Provide PDF URLs (or blank if '#')
    'Certificate 1 URL': item?.certificate1_path && item.certificate1_path !== '#' ? item.certificate1_path : '',
    'From Date 1': item?.from_date1 ? formatDate(item.from_date1, 'dd/MM/yyyy', 'en-US') : 'N/A',
    'To Date 1': item?.expiry_date1 ? formatDate(item.expiry_date1, 'dd/MM/yyyy', 'en-US') : 'N/A',
    'Certificate 2 URL': item?.certificate2_path && item.certificate2_path !== '#' ? item.certificate2_path : '',
    'From Date 2': item?.from_date2 ? formatDate(item.from_date2, 'dd/MM/yyyy', 'en-US') : 'N/A',
    'To Date 2': item?.expiry_date2 ? formatDate(item.expiry_date2, 'dd/MM/yyyy', 'en-US') : 'N/A',
    'Created Date': item?.createdDate ? formatDate(item.createdDate, 'dd/MM/yyyy', 'en-US') : 'N/A',
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Certificate List');

  // filename uses manufacturer (if selected) for clarity
  const manuName = this.selectManu?.text ? this.selectManu.text.replace(/\s+/g, '_') : 'All';
  const filename = `Certificate_List_${manuName}.xlsx`;

  XLSX.writeFile(wb, filename);
    }
  
  
  
    // ----------------------------end --------------------------------------------------------------
  

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }

  onUploadCertificate(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
        selectManu : this.selectManu
      },
    };
    this.bsModalRef = this.modalService.show(
      UploadCertificateComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.excelMenuId = this.selectManu?.value;
      this.getCertificateList(this.selectManu?.value)
    });
  }

  openPdf(pdfUrl: string | null) {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert('PDF URL not available');
    }
  }

//   downloadExcel() {
//   const list = this.certificateList || [];

//   if (!list.length) {
//     return;
//   }

//   const excelData = list.map((item: any, index: number) => ({
//     'S.No': index + 1,
//     'Manufacturer Name': item?.pk_emp_name || 'NA',
//     'Product Name': item?.pk_product_name || 'NA',
//     'Issue Authority': item?.pk_issueby_name || 'NA',
//     // Provide PDF URLs (or blank if '#')
//     'Certificate 1 URL': item?.certificate1_path && item.certificate1_path !== '#' ? item.certificate1_path : '',
//     'From Date 1': item?.from_date1 ? formatDate(item.from_date1, 'dd/MM/yyyy', 'en-US') : 'N/A',
//     'To Date 1': item?.expiry_date1 ? formatDate(item.expiry_date1, 'dd/MM/yyyy', 'en-US') : 'N/A',
//     'Certificate 2 URL': item?.certificate2_path && item.certificate2_path !== '#' ? item.certificate2_path : '',
//     'From Date 2': item?.from_date2 ? formatDate(item.from_date2, 'dd/MM/yyyy', 'en-US') : 'N/A',
//     'To Date 2': item?.expiry_date2 ? formatDate(item.expiry_date2, 'dd/MM/yyyy', 'en-US') : 'N/A',
//     'Created Date': item?.createdDate ? formatDate(item.createdDate, 'dd/MM/yyyy', 'en-US') : 'N/A',
//   }));

//   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Certificate List');

//   // filename uses manufacturer (if selected) for clarity
//   const manuName = this.selectManu?.text ? this.selectManu.text.replace(/\s+/g, '_') : 'All';
//   const filename = `Certificate_List_${manuName}.xlsx`;

//   XLSX.writeFile(wb, filename);
// }

}
