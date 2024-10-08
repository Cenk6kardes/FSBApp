import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-project-filter',
  templateUrl: './project-filter.component.html',
  styleUrls: ['./project-filter.component.scss']
})
export class ProjectFilterComponent{
  
  @Input() projectFilters: any[] = [];
  @Output() deleteFilterEmitter: any = new EventEmitter();
  constructor() { }

  deleteFilter = (item: any) => {
    const index = this.projectFilters.findIndex( (val: any) => {
      return (val.category === item.category && val.text === item.text);
    });

    if(index !== -1){
      this.projectFilters.splice(index, 1);
      this.deleteFilterEmitter.emit({value: this.projectFilters})
    }
  } 

  returnListRowSize = (projectFilters: any) => {
    return Math.ceil(projectFilters.length/3)
  }

  returnListColumnSize = (val: number) => {
    return val*3 + 3 <= this.projectFilters.length ? 3 : this.projectFilters.length %3;
  }

  onDeleteAll = () => {
    if(this.projectFilters.length > 0){
      this.projectFilters.splice(0,this.projectFilters.length)
      this.deleteFilterEmitter.emit({value: this.projectFilters});
    }
  }

}
