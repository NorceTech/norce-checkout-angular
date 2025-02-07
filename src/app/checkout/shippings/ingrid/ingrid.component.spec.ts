import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngridComponent } from './ingrid.component';

describe('IngridComponent', () => {
  let component: IngridComponent;
  let fixture: ComponentFixture<IngridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
