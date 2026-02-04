import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/app.reducer';
import { clearAuth } from '../../../../core/app.action';
import { CommonService } from '../../services/common.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { WalletPageComponent } from '../../component/wallet-page/wallet-page.component';
import { WalletServiceService } from '../../services/wallet/wallet-service.service';
import { WalletLedgerPageComponent } from '../../component/wallet-ledger-page/wallet-ledger-page.component';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isDropdownOpen = false;
  userDetails: any;
  bsModalRef!: BsModalRef;
  walletResponse: any;

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private commonService: CommonService,
    private modalService: BsModalService,
    private walletService: WalletServiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res;
    });
  }

  ngOnInit() {
    if (this.userDetails?.RoleId == 2 || this.userDetails?.RoleId == 3) {
      this.getUserWalletDetail();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.store.dispatch(clearAuth());
    this.router.navigate(['/login']);
    this.isDropdownOpen = false;
  }

  getUserWalletDetail() {
    this.walletService.getUserWallet().subscribe((res: any) => {
      setTimeout(() => {
        this.walletResponse = res?.body;
        this.cdr.detectChanges();
      });
    });
  }

  onWalletPage() {
    const initialState: ModalOptions = {
      initialState: {
        apiResponseData: this.walletResponse,
      },
    };
    this.bsModalRef = this.modalService.show(
      WalletPageComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.walletResponse = [];
      this.getUserWalletDetail();
    });
  }

  onSelectWalletLedger(){
    this.router.navigate(
      ['/admin/wallet-ledger']);
  }
}
