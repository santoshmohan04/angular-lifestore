import { Component, OnDestroy, OnInit, signal, effect, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthService, AuthResponseData } from "../services/auth.service";
import { SnackbarService } from "../services/snackbar.service";
import { AuthStore } from "../store/auth.store";
import { SharedService } from "../services/shared.services";
import { ImagePathPipe } from "../pipes/image-path.pipe";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
    standalone: true,
    imports: [
      CommonModule, 
      FormsModule, 
      MatTabsModule, 
      MatCardModule, 
      MatButtonModule, 
      MatInputModule, 
      MatFormFieldModule,
      MatExpansionModule,
      MatProgressSpinnerModule,
      ImagePathPipe
    ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  selectedTabIndex = 0;
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  userOrds = signal<any[]>([]);
  
  // Inject stores
  readonly authStore = inject(AuthStore);
  userdetails = signal<AuthResponseData | null>(null);

  constructor(
    public authService: AuthService,
    private readonly sharedService: SharedService,
    private readonly snackbar: SnackbarService
  ) {
    // Effect to handle auth state and errors
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.userdetails.set(user);
      }
      
      const error = this.authStore.error();
      if (error) {
        this.isLoading.set(false);
        this.snackbar.showError(error);
      }
    });
  }

  ngOnInit(): void {
    this.getOrds();
  }

  getOrds() {
    this.sharedService.getUserOrders().subscribe({
      next: (orders) => {
        this.isLoading.set(false);
        this.userOrds.set(Array.isArray(orders) ? orders : Object.values(orders));
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackbar.showError(err.message || 'Failed to load orders');
      }
    });
  }

  onChange(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const newPswd = form.value.newpswd;
    const confPswd = form.value.repswd;
    if (newPswd == confPswd) {
      this.isLoading.set(true);
      const pswdpayload = {
        password: confPswd
      };

      this.authStore.changePassword(pswdpayload);

      form.reset();
    } else {
      this.error.set("New Password and Confirm Password do not match");
    }
  }

  ngOnDestroy(): void {
    this.error.set(null);
  }
}
