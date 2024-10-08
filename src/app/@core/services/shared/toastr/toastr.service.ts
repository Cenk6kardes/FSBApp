import { Injectable } from '@angular/core';
import { NbComponentStatus, NbGlobalPhysicalPosition, NbGlobalPosition, NbToastrService } from '@nebular/theme';
import { ToastrModel } from 'src/app/@core/models/shared/toastr.model';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  private _props: ToastrModel = {
    destroyByClick: true,
    duration: 4000,
    hasIcon: true,
    position: NbGlobalPhysicalPosition.TOP_RIGHT,
    preventDuplicate: true
  };

  constructor(private toastrService: NbToastrService) { }

  public get props(): ToastrModel {
    return this._props;
  }
  public set props(value: ToastrModel) {
    this._props = value;
  }

  showInfo = (msg: string, title?: string) => {
    if (!title) title = 'Info';
    this.showToastr('info', msg, title, 'alert-circle')
  }

  showSuccess = (msg: string, title?: string) => {
    if (!title) title = 'Success!';
    this.showToastr('success', msg, title, 'checkmark-circle-2')
  }

  showWarning = (msg: string, title?: string) => {
    if (!title) title = 'Warning!';
    this.showToastr('warning', msg, title, 'alert-triangle')
  }

  showError = (msg: string, title?: string) => {
    if (!title) title = 'Oops!';
    this.showToastr('danger', msg, title, 'alert-circle')
  }

  private showToastr(type: NbComponentStatus, msg: string, title?: string, icon?: string) {
    const config = {
      status: type,
      destroyByClick: this.props.destroyByClick,
      duration: this.props.duration,
      hasIcon: this.props.hasIcon,
      position: this.props.position,
      preventDuplicates: this.props.preventDuplicate,
      icon: icon
    };
    const titleContent = title ? `${title}` : ''; // Title is not required
    this.toastrService.show(
      msg,
      titleContent,
      config);
  }
}
