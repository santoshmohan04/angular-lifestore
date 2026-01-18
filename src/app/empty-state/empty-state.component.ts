import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No items found';
  @Input() message: string = 'There are no items to display at this time.';
  @Input() actionText: string = '';
  @Input() actionIcon: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() action = new EventEmitter<void>();

  onActionClick(): void {
    this.action.emit();
  }

  get iconSize(): string {
    const sizes = {
      small: '48',
      medium: '64',
      large: '96'
    };
    return sizes[this.size];
  }

  get titleClass(): string {
    const classes = {
      small: 'mat-headline-5',
      medium: 'mat-headline-4',
      large: 'mat-headline-3'
    };
    return classes[this.size];
  }
}
