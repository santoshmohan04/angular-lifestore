import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingStore } from '../store/loading.store';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
  private readonly loadingStore = inject(LoadingStore);

  isLoading = computed(() => this.loadingStore.isLoading());
}
