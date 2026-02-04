import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMenuMasterComponent } from './manage-menu-master.component';

describe('ManageMenuMasterComponent', () => {
  let component: ManageMenuMasterComponent;
  let fixture: ComponentFixture<ManageMenuMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageMenuMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMenuMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
