import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDevicePlanComponent } from './manage-device-plan.component';

describe('ManageDevicePlanComponent', () => {
  let component: ManageDevicePlanComponent;
  let fixture: ComponentFixture<ManageDevicePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageDevicePlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDevicePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
