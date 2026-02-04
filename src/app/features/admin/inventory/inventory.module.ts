import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ManageInventoryComponent } from './inventory-manage/pages/manage-inventory/manage-inventory.component';
import { InventoryDashboardComponent } from './inventory-manage/components/inventory-dashboard/inventory-dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { TransferDeviceDataComponent } from './inventory-manage/components/transfer-device-data/transfer-device-data.component';


@NgModule({
  declarations: [
    ManageInventoryComponent,
    InventoryDashboardComponent,
    TransferDeviceDataComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }
