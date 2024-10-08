import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbDialogRef, NbInputModule, NbButtonModule, NbAlertModule, NbSpinnerModule } from '@nebular/theme';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbInputModule, NbButtonModule, NbAlertModule, NbSpinnerModule],
  styleUrls: ['./delete-dialog.component.scss'],
  template: `
  <nb-card class="dialog" [nbSpinner]="loading">
  <nb-card-header class="modal-title">
      {{title}}
  </nb-card-header>
  <nb-card-body  *ngIf="!fromTree && !entities">
      Are you sure you want to delete <b>{{item.name}}</b>?
      <br><br><span *ngIf="projects?.length > 0">Project List</span>
      <ul>
        <li *ngFor=" let project of projects"><b>{{project?.name}}</b></li>
      </ul>
  </nb-card-body>
    <nb-card-body  *ngIf="!fromTree && entities">
      Are you sure you want to delete <b>{{item.name}}</b>? Once deleted all associated entities, Projects and COA will be deleted, please confirm 
      <br><br><span *ngIf="entities?.length > 0">Entity List</span>
      <ul>
        <li *ngFor=" let entity of entities"><b>{{entity.name}}</b></li>
      </ul>
      <span *ngIf="projects?.length > 0">Project List</span>
      <ul>
        <li *ngFor=" let project of projects"><b>{{project?.name}}</b></li>
      </ul>
      <span *ngIf="engCoa?.length > 0">Engagement Coa List</span>
      <ul>
        <li *ngFor=" let coa of engCoa"><b>{{coa?.name}}</b></li>
      </ul>
    </nb-card-body>
  <nb-card-body *ngIf="fromTree">
      Are you sure you want to delete <b>{{item.item}}</b>?<br>
      <b *ngIf="title == 'Delete Project'">
        If you have values in Balance Processing, the data will be lost!
      </b>
  </nb-card-body>
  <nb-card-footer class=" modal-footer d-flex justify-content-end">
      <button class="transparent-button" nbButton (click)="close()">Cancel</button>
      <button class="primary-button" nbButton (click)="save()" status="danger">Delete</button>
  </nb-card-footer>
</nb-card>`,
})
export class DeleteDialogComponent implements OnInit {
  @Input() title: string = '';
  @Input() fromTree: boolean = false;
  @Input() item: any;
  @Input() entities: any;
  @Input() engCoa: any;
  @Input() projects: any;
  @Output() delete = new EventEmitter<boolean>();

  public loading: boolean = false;
  constructor(private ref: NbDialogRef<DeleteDialogComponent>) { }

  ngOnInit(): void {
  }

  close() {
    // if (this.fromTree)
    this.ref.close({ deleted: false });
    // else
    //   this.delete.emit(false);
  }

  save() {
    if (this.fromTree)
      this.ref.close({ dialogRef: this.ref, deleted: true });
    else {
      this.loading = true;
      this.delete.emit(this.loading);
    }
  }


}
