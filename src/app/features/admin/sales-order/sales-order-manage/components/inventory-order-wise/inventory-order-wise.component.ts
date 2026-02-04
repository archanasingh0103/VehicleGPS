import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { formatDate, Location } from '@angular/common';
import * as XLSX from 'xlsx';
import { NotificationService } from '../../../../../shared/services/notification.service';
@Component({
  selector: 'app-inventory-order-wise',
  standalone: false,
  templateUrl: './inventory-order-wise.component.html',
  styleUrl: './inventory-order-wise.component.scss'
})
export class InventoryOrderWiseComponent {
  inventoryOrderData: any;
  poHeaderid: any;
  createdBy: any;
  columns: any;
  isLoading: boolean = false;
 isExcelLoading: boolean = false;
  excelpagecount: any = 0;
   pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
 get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }
  searchKeyword: string = '';
  constructor(
    private route: ActivatedRoute,
    private salesOrderService: SalesOrderService,
    private location: Location,
      private NotificationService: NotificationService
  ) {
    this.route.params.subscribe(params => {
      this.poHeaderid = params['id'];
    });
  }
  ngOnInit() {
    this.setInitialTable();
    if(this.poHeaderid){
      this.getInventoryData()
    }
  }

  setInitialTable() {
    this.columns = [
      { key: 'Uid', title: 'Uid' },
      { key: 'Imei', title: 'Imei' },
      { key: 'Iccid', title: 'Iccid' },
      { key: 'Vahan S.No.', title: 'Vahan S.No.' },
      { key: 'Integrator', title: 'Integrator' },
      { key: 'Duration', title: 'Duration' },
      { key: 'Activation Date', title: 'Activation Date' },
      { key: 'Valid Date', title: 'Valid Date' },
      { key: 'P.TSP', title: 'P.TSP' },
      { key: 'P.Sim No.', title: 'P.Sim No.' },
      { key: 'S.TSP', title: 'S.TSP' },
      { key: 'S.Sim No.', title: 'S.Sim No.' },

    ]
  }

  getInventoryData() {
    this.isLoading = true;
    let payload = {
      "po_request_id": this.poHeaderid ? Number(this.poHeaderid) : 0
    }
    this.salesOrderService.inventoryOrder(payload).subscribe((res: any) => {
      this.isLoading = false;
      this.inventoryOrderData = res.body?.result || [];
      this.excelpagecount = res?.body?.result?.length || 0;
    });
  }

    // --------------- ayushi start 28/01/2026 ----------------------------------------------
  
    getAllDataList(): Promise<any[]> {
      this.isExcelLoading = true;
  
      let payload = {
      "po_request_id": this.poHeaderid ? Number(this.poHeaderid) : 0,
        pageSize: this.excelpagecount
    }
  
      return new Promise((resolve, reject) => {
        this.salesOrderService.inventoryOrder(payload).subscribe({
          next: (res: any) => {
            this.isExcelLoading = false;
            if (res?.body?.isSuccess) {
              resolve(res.body?.result);
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
        'Uid': item.uid,
        'Imei': item.imei,
        'Iccid': item.iccid,
        'Vahan S.No.': item.vahan_sno,
        "Integrator": item.integrator_name,
        "Duration": item.sim_duration,
        "Activation Date": formatDate(item.activated_date, 'yyyy-MM-dd', 'en-US'),
        "Valid Date": formatDate(item.valid_till_date, 'yyyy-MM-dd', 'en-US'),
        "P.TSP": item.primary_tsp,
        "P.Sim No.": item.primary_sim,
        "S.TSP": item.second_tsp,
        "S.Sim No.": item.second_sim,
      }));
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vahan Details');
          XLSX.writeFile(wb, 'vahan_details.xlsx');
    }
  
  
    // ----------------------------end --------------------------------------------------------------
  
    // downloadExcel() {
    //   if (!this.inventoryOrderData || this.inventoryOrderData.length === 0) {
    //     return;
    //   }
  
    //   const excelData = this.inventoryOrderData.map((item: any, index: number) => ({
    //     'S.No': index + 1,
    //     'Uid': item.uid,
    //     'Imei': item.imei,
    //     'Iccid': item.iccid,
    //     'Vahan S.No.': item.vahan_sno,
    //     "Integrator": item.integrator_name,
    //     "Duration": item.sim_duration,
    //     "Activation Date": formatDate(item.activated_date, 'yyyy-MM-dd', 'en-US'),
    //     "Valid Date": formatDate(item.valid_till_date, 'yyyy-MM-dd', 'en-US'),
    //     "P.TSP": item.primary_tsp,
    //     "P.Sim No.": item.primary_sim,
    //     "S.TSP": item.second_tsp,
    //     "S.Sim No.": item.second_sim,
    //   }));
  
    //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      
    //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, 'Vahan Details');
    //       XLSX.writeFile(wb, 'vahan_details.xlsx');
    // }
  
    downloadText() {
      if (!this.inventoryOrderData || this.inventoryOrderData.length === 0) {
        return;
      }
  
      const textContent = this.inventoryOrderData
        .map((item:any) => item.vahan_string)
        .join('\n');
  
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vahan_strings.txt';
      link.click();
      window.URL.revokeObjectURL(url);
    }

  goBack() {
    this.location.back();
  }
    onSearch(event:any) {
    const searchValue = event.target.value.trim().replace(/\s+/g, ' ');
    this.searchKeyword = searchValue;
    this.inventoryOrderData = [];
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getInventoryData();  
  }

    onTablePageChange(event: number) {
    this.pagesize.offset = event;
    this.getInventoryData()
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
    this.getInventoryData()
  }

   clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getInventoryData();  
  }
}
