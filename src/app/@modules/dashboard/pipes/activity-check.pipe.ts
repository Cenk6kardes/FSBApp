import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'activityCheck',
    pure: false
})
export class ActivityCheckPipe implements PipeTransform {
    transform(items: any): any {
        if (!items) {
            return items;
        }
        return items.filter(item => item.active);
    }
}