import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePlanComponent } from './device-plan.component';

describe('DevicePlanComponent', () => {
  let component: DevicePlanComponent;
  let fixture: ComponentFixture<DevicePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevicePlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
