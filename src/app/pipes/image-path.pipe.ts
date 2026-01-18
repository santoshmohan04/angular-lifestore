import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagePath',
  standalone: true
})
export class ImagePathPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return 'assets/img/placeholder.jpg';
    }
    
    // If the path already starts with 'assets/', return as is
    if (value.startsWith('assets/')) {
      return value;
    }
    
    // If the path starts with 'img/', prepend 'assets/'
    if (value.startsWith('img/')) {
      return `assets/${value}`;
    }
    
    // If the path starts with '/img/', replace with 'assets/img/'
    if (value.startsWith('/img/')) {
      return `assets${value}`;
    }
    
    // Default: assume it's a relative path and prepend 'assets/'
    return `assets/${value}`;
  }
}
