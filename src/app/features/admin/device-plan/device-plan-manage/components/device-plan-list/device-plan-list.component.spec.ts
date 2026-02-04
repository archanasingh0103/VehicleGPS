import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePlanListComponent } from './device-plan-list.component';

describe('DevicePlanListComponent', () => {
  let component: DevicePlanListComponent;
  let fixture: ComponentFixture<DevicePlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevicePlanListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicePlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
