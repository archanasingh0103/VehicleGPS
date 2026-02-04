import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HeaderComponent } from './layout/header/header.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SafeHtmlPipe } from './services/safe-html.service';
import { LoginComponent } from './component/login/login.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './component/loader/loader.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SearchFilterPipe } from './pipe/search.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalModule } from "ngx-bootstrap/modal";
import { ToastrModule } from 'ngx-toastr';
import { ProfileComponent } from './component/profile/profile.component';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmationComponent } from './component/delete-confirmation/delete-confirmation.component';
import { ClipboardModule } from 'ngx-clipboard';
import { MatTabsModule } from '@angular/material/tabs';
import { ManagePlanComponent } from './common-folder/plan/manage-plan/manage-plan.component';
import { DevicePlanComponent } from './common-folder/plan/device-plan/device-plan.component';
import { ServicePlanComponent } from './common-folder/plan/service-plan/service-plan.component';
import { WalletPageComponent } from './component/wallet-page/wallet-page.component';
import { WalletLedgerPageComponent } from './component/wallet-ledger-page/wallet-ledger-page.component';
import { AddMoneyWalletComponent } from './component/add-money-wallet/add-money-wallet.component';



@NgModule({
  declarations: [
    NavbarComponent,
    HeaderComponent,
    MainLayoutComponent,
    SafeHtmlPipe,
    LoginComponent,
    PageNotFoundComponent,
    LoaderComponent,
    SearchFilterPipe,
    ProfileComponent,
    DeleteConfirmationComponent,
    ManagePlanComponent,
    DevicePlanComponent,
    ServicePlanComponent,
    WalletPageComponent,
    WalletLedgerPageComponent,
    AddMoneyWalletComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    ModalModule.forRoot(),
    FormsModule,
    ToastrModule.forRoot(),
    SelectDropDownModule,
    MatNativeDateModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule

  ],
  exports: [
    SafeHtmlPipe,
    ReactiveFormsModule,
    NgxSpinnerModule,
    SearchFilterPipe,
    LoaderComponent,
    NgxPaginationModule,
    ModalModule,
    FormsModule,
    ToastrModule,
    SelectDropDownModule,
    MatButtonModule,
    MatMenuModule,
    MatNativeDateModule,
    MatIconModule,
    DeleteConfirmationComponent,
    MatTabsModule
  ]
})
export class SharedModule { }
