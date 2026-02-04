import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { WalletServiceService } from '../../services/wallet/wallet-service.service';
import { CommonService } from '../../services/common.service';
import { NotificationService } from '../../services/notification.service';
declare var Razorpay: any;

@Component({
  selector: 'app-wallet-page',
  standalone: false,
  templateUrl: './wallet-page.component.html',
  styleUrl: './wallet-page.component.scss'
})
export class WalletPageComponent {
  @Output() mapdata = new EventEmitter()

  walletResponse: any;
  isLoading: boolean = false
  isPaymentLoading: boolean = false
  userDetails: any;
  private readonly auth = {
    key: 'rzp_test_7vlYuPgiXRe6AF',
    secret: 'DYbYxKf4GD1TtBl20mnNhxJG'
  };
  constructor(
    private bsModalService: BsModalService,
    private walletService: WalletServiceService,
    private commonService: CommonService,
    private NotificationService: NotificationService,
    private zone: NgZone

  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    })
  }

  ngOnInit() {
    this.getUserWalletDetail()
  }

  getUserWalletDetail() {
    this.isLoading = true
    this.walletService.getUserWallet().subscribe((res: any) => {
      this.isLoading = false
      this.walletResponse = res?.body
    })
  }

  createWallet() {
    let payload = {}
    this.walletService.createWallet(payload).subscribe((res: any) => {
      this.walletResponse = res?.body
    })
  }

  addAmount: number | null = null;
  addAmountError: string = '';

  openRazorpay(amountInRupees: any) {
    if (!amountInRupees || amountInRupees <= 0) {
      this.addAmountError = "Please enter a valid amount.";
      return;
    }

    this.addAmountError = "";
    const amountInPaise = amountInRupees * 100;
    const options: any = {
      key: this.auth.key,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Wallet Recharge',
      description: 'Add money to wallet',

      handler: (response: any) => {
        this.zone.run(() => {
          this.isPaymentLoading = true;
          this.addMoney(amountInRupees, response, 'Success');
        });
        this.addAmount = null;
      }
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      console.error('Payment failed:', response);
      this.addMoney(amountInRupees, response, 'Failed');
      alert('Payment Failed: ' + (response.error?.description || 'Unknown error'));
    });

    rzp.open();
  }

  addMoney(amountInRupees: number, razorpayRes: any, status: any) {
    let payload = {
      "customer_id": Number(this.userDetails.Id),
      "credit_amount": Number(amountInRupees),
      "description": `Wallet recharge of ₹${amountInRupees}`,
      "payment_mode": 'Online',
      "infoDto": {
        "gatewayName": 'Razorpay',
        "paymentId": razorpayRes.razorpay_payment_id,
        "orderId": null,
        "status": status,
        "signature": null,
        "rawResponse": JSON.stringify(razorpayRes)
      }
    };
    this.walletService.addMoney(payload).subscribe((res: any) => {
      this.isPaymentLoading = false
      if (res?.body?.isSuccess === true) {
        this.mapdata.emit();
        this.bsModalService.hide();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    })

  }

  cancel() {
    this.bsModalService.hide();
  }

}
