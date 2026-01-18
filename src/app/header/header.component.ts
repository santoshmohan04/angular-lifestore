import { Component, computed, ChangeDetectionStrategy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { SnackbarService } from "../services/snackbar.service";
import { AuthStore } from "../store/auth.store";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatMenuModule,
      MatDialogModule,
      MatDividerModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  // Inject AuthStore
  readonly authStore = inject(AuthStore);
  
  // Computed signals for UI
  isAuthenticated = computed(() => this.authStore.isLoggedIn());
  userEmail = computed(() => this.authStore.userEmail());

  constructor(
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authStore.logout();
    }
  }
}
