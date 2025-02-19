import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalleyComponent } from './walley.component';

describe('WalleyComponent', () => {
  let component: WalleyComponent;
  let fixture: ComponentFixture<WalleyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalleyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalleyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
