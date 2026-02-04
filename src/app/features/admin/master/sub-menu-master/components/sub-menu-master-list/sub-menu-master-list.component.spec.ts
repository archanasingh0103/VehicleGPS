import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMenuMasterListComponent } from './sub-menu-master-list.component';

describe('SubMenuMasterListComponent', () => {
  let component: SubMenuMasterListComponent;
  let fixture: ComponentFixture<SubMenuMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubMenuMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubMenuMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
