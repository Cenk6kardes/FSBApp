import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { OperationType } from '../../Infrastructure/constants/constants';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() modalType: string = 'info';
  @Output() confirm = new EventEmitter<boolean>(false);

  constructor(private ref: NbDialogRef<ConfirmDialogComponent>) { }

  close() {
    this.ref.close({ confirm: false });
  }

  save() {
    this.ref.close({ dialogRef: this.ref, confirm: true });
  }

}
