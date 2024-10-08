import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NbDialogRef, NbDialogService} from '@nebular/theme';
import {Subject} from 'rxjs';
import {IUserModel, IUserModelRequest} from 'src/app/@core/models/user/user-model';
import {ToastrService} from 'src/app/@core/services/shared/toastr/toastr.service';
import {UserService} from 'src/app/@core/services/user/user.service';
import {AddUserTeamsComponent} from './add-user-teams/add-user-teams.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TeamsComponent implements OnInit {

  private dialogRef: NbDialogRef<any>;
  itemUser: IUserModel = {} as IUserModel;
  userRequest: IUserModelRequest[]  = [];
  private readonly unSubscribe$ = new Subject<void>();
  public loagingChanges:boolean = false;

  constructor(private dialogService: NbDialogService,
    private userService: UserService,
    private toastr: ToastrService,) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    let headerLabel = `Add New User`;

    this.dialogService.open(AddUserTeamsComponent,{
      context: {
        title: headerLabel,
        itemUser: this.itemUser,
      },
      closeOnBackdropClick: false
    });
  }

}


