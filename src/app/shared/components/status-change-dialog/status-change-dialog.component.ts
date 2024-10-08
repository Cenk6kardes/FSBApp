import { outputAst } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-status-change-dialog',
  templateUrl: './status-change-dialog.component.html',
  styleUrls: ['./status-change-dialog.component.scss']
})
export class StatusChangeDialogComponent implements OnInit {
  @Input() title: string = '';
  @Input() body: string = '';
  @Output() confirm = new EventEmitter<boolean>(false);

  constructor(protected ref: NbDialogRef<StatusChangeDialogComponent>) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.ref.close({ confirm: false });
  }

  confirmDialog() {
    this.ref.close({ confirm: true });
  }

}
