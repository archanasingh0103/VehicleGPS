import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMenuMasterComponent } from './create-menu-master.component';

describe('CreateMenuMasterComponent', () => {
  let component: CreateMenuMasterComponent;
  let fixture: ComponentFixture<CreateMenuMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMenuMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMenuMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
