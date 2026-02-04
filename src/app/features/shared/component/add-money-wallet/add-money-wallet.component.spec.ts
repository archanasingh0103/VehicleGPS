import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMoneyWalletComponent } from './add-money-wallet.component';

describe('AddMoneyWalletComponent', () => {
  let component: AddMoneyWalletComponent;
  let fixture: ComponentFixture<AddMoneyWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddMoneyWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMoneyWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
