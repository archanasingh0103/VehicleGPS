import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServiceMasterService } from '../../../../admin/master/service-master/services/service-master.service';

@Component({
  selector: 'app-service-plan',
  standalone: false,
  templateUrl: './service-plan.component.html',
  styleUrl: './service-plan.component.scss'
})
export class ServicePlanComponent {
  isLoading: boolean = false;
  servicePlanList: any;
  public columns!: any;
  servicePlanForm!: FormGroup
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  serviceLIstDD: any;
  constructor(
    private fb: FormBuilder,
    private serviceMasterService: ServiceMasterService,
  ) { }

  ngOnInit() {
    this.setInitialForm()
    this.setInitialValue()
    this.getServiceList()
  }

  setInitialForm() {
    this.servicePlanForm = this.fb.group({
      service: [null, [Validators.required]],
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

  getServiceList() {
    this.serviceMasterService.serviceList().subscribe((res: any) => {
      if (res?.status == 200) {
        this.serviceLIstDD = res.body.result.map((item: any) => ({
          value: item.pk_service_id,
          text: item.service_name
        }));
      }
    })
  }
}
