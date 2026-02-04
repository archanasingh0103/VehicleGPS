import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuMasterListComponent } from './menu-master-list.component';

describe('MenuMasterListComponent', () => {
  let component: MenuMasterListComponent;
  let fixture: ComponentFixture<MenuMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
