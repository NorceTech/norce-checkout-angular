import { Component, computed, inject, input, output } from '@angular/core';
import {
  ControlType,
  DynamicFormControl,
} from '~/app/shared/dynamic-form/dynamic-form.types';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { derivedAsync } from 'ngxtension/derived-async';
import { map, mergeWith } from 'rxjs';
import { SyncService } from '~/app/core/sync/sync.service';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, Button, InputText],
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent {
  private syncService = inject(SyncService);
  fields = input.required<DynamicFormControl[]>();
  onSubmit = output<any>();

  form = computed(() => {
    const form = new FormGroup({});
    this.fields().forEach((field) => {
      form.addControl(field.id, field.toFormControl());
    });
    return form;
  });
  disabled = derivedAsync(() => {
    return this.form().valueChanges.pipe(
      map(() => this.form().invalid),
      mergeWith(this.syncService.hasInFlightRequest$),
    );
  });

  handleSubmit() {
    if (this.form().invalid) return;
    this.onSubmit.emit(this.form().value);
  }

  protected readonly ControlType = ControlType;
}
