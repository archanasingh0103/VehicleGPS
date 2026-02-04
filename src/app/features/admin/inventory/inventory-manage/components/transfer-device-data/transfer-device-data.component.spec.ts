import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferDeviceDataComponent } from './transfer-device-data.component';

describe('TransferDeviceDataComponent', () => {
  let component: TransferDeviceDataComponent;
  let fixture: ComponentFixture<TransferDeviceDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransferDeviceDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferDeviceDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
