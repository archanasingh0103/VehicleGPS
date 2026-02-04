import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubMenuMasterComponent } from './manage-sub-menu-master.component';

describe('ManageSubMenuMasterComponent', () => {
  let component: ManageSubMenuMasterComponent;
  let fixture: ComponentFixture<ManageSubMenuMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageSubMenuMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubMenuMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
