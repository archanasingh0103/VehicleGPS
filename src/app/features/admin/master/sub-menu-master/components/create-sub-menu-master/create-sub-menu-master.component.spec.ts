import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubMenuMasterComponent } from './create-sub-menu-master.component';

describe('CreateSubMenuMasterComponent', () => {
  let component: CreateSubMenuMasterComponent;
  let fixture: ComponentFixture<CreateSubMenuMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSubMenuMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSubMenuMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
