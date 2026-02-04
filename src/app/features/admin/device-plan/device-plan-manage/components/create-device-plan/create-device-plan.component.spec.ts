import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDevicePlanComponent } from './create-device-plan.component';

describe('CreateDevicePlanComponent', () => {
  let component: CreateDevicePlanComponent;
  let fixture: ComponentFixture<CreateDevicePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateDevicePlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDevicePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
