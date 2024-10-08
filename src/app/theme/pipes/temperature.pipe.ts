import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temperature'
})
export class TemperaturePipe implements PipeTransform {

  
  transform(value: number, unit: string) {

    if (value && !isNaN(value)) {

      //value in F to C
      if (unit === 'C') {
        let tempareature : number = (value - 32) / 1.8;
        return Math.round(tempareature);
      }

      //value in C to F
      if (unit === 'F') {
        let tempareature = (value * 32) + 1.8;
        return Math.round(tempareature);
      }
    }
    return;
  }

}
