import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletLedgerPageComponent } from './wallet-ledger-page.component';

describe('WalletLedgerPageComponent', () => {
  let component: WalletLedgerPageComponent;
  let fixture: ComponentFixture<WalletLedgerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletLedgerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletLedgerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
