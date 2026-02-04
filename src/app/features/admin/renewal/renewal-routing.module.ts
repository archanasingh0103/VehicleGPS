import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageRenewalComponent } from './manage-renewal/pages/manage-renewal/manage-renewal.component';
import { RenewalDashboardComponent } from './manage-renewal/components/renewal-dashboard/renewal-dashboard.component';

const routes: Routes = [
  {
    path:'renewal-list',component:RenewalDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RenewalRoutingModule { }
