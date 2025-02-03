import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultConfirmationComponent } from './default-confirmation.component';

describe('DefaultConfirmationComponent', () => {
  let component: DefaultConfirmationComponent;
  let fixture: ComponentFixture<DefaultConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
