import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../services/common.service';
import { NotificationService } from '../../services/notification.service';
import { WalletServiceService } from '../../services/wallet/wallet-service.service';

@Component({
  selector: 'app-add-money-wallet',
  standalone: false,
  templateUrl: './add-money-wallet.component.html',
  styleUrl: './add-money-wallet.component.scss',
})
export class AddMoneyWalletComponent {
  @Output() mapdata = new EventEmitter();
  addMoneyForm!: FormGroup;
  tittle: string = 'Add';
  userDetails: any;
  editData: any;
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private walletService: WalletServiceService,
    private commonService: CommonService
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    });
  }

  ngOnInit() {
    this.setInitialForm();
  }

  setInitialForm() {
    this.addMoneyForm = this.fb.group({
      amount: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
    });
  }

  submit(formValue: any) {
    if (this.addMoneyForm.invalid) {
      this.addMoneyForm.markAllAsTouched();
      return;
    }

      let payload = {
      "customer_id": Number(this.editData.empId),
      "credit_amount": Number(formValue.amount),
      "description": 'From Admin',
      "payment_mode": 'Offline',
      "infoDto": {
        "gatewayName": 'Admin',
        "paymentId": "",
        "orderId": "",
        "status": "success",
        "signature": "",
        "rawResponse": ""
      }
    };

    this.walletService.addMoney(payload).subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    });
  }

  cancel() {
    this.bsModalService.hide();
  }
}
