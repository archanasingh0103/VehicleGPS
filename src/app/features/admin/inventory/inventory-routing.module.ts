import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageInventoryComponent } from './inventory-manage/pages/manage-inventory/manage-inventory.component';

const routes: Routes = [
    {
      path:'inventory-list',component:ManageInventoryComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
