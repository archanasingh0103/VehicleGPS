import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../../admin/order/services/order.service';

@Component({
  selector: 'app-device-plan',
  standalone: false,
  templateUrl: './device-plan.component.html',
  styleUrl: './device-plan.component.scss'
})
export class DevicePlanComponent {
  isLoading: boolean = false;
  devicePlanList: any;
  public columns!: any;
  devicePlanForm!: FormGroup
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  productList: any;
  constructor(
    private fb: FormBuilder,
    private OrderService: OrderService,

  ) { }

  ngOnInit() {
    this.setInitialForm()
    this.setInitialValue()
    this.getProductList()
  }

  setInitialForm() {
    this.devicePlanForm = this.fb.group({
      device: [null, [Validators.required]],
      amount: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
    })
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Name', title: 'Name' },
      { key: 'From Date', title: 'From Date' },
      { key: 'To Date', title: 'To Date' },
      { key: 'Amount', title: 'Amount' },
      { key: 'Action', title: 'Action' },
    ];
  }

  getProductList() {
    let payload = {
      fk_device_category_id: 0
    }
    this.OrderService.orderProductList(payload).subscribe((res: any) => {
      if (res?.status == 200) {
        this.productList = res.body.result.map((item: any) => ({
          value: item.fk_device_category_id,
          text: item.device_subcategory_name
        }));
      }
    })
  }
}
