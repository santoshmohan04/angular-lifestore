import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  effect,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { CartStore, CartItem } from "../store/cart.store";
import { SharedService } from "../services/shared.services";
import { take } from "rxjs";

@Component({
  selector: "app-cart-signal",
  templateUrl: "./cart-signal.component.html",
  styleUrls: ["./cart-signal.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  providers: [CartStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSignalComponent implements OnInit {
    readonly store = inject(CartStore);
    private sharedService = inject(SharedService);
  // Inject the signal store
  constructor(
    private snackBar: MatSnackBar
  ) {
    // React to errors
    effect(() => {
      const error = this.store.error();
      if (error) {
        this.showError(error);
        this.store.clearError();
      }
    });
  }

  ngOnInit(): void {
    // Load cart items on init
    this.store.loadCart();
  }

  incrementQuantity(item: CartItem): void {
    this.store.incrementQuantity(item.id);
  }

  decrementQuantity(item: CartItem): void {
    this.store.decrementQuantity(item.id);
  }

  removeItem(item: CartItem): void {
    if (confirm(`Remove ${item.name} from cart?`)) {
      this.store.removeItem(item.id);
      this.showSuccess('Item removed from cart');
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.store.clearCart();
      this.showSuccess('Cart cleared');
    }
  }

  checkout(): void {
    const items = this.store.items();
    const total = this.store.grandTotal();
    
    // Prepare order data
    const orderItems = items.map(item => ({
      productId: item.productId || item.id,
      quantity: item.qty,
      price: item.price,
      name: item.name,
      image: item.image
    }));

    const ordData = {
      items: orderItems,
      total: total
    };
    
    // Place order and clear cart on success
    this.sharedService.conformOrder(ordData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.showSuccess('Order placed successfully!');
          this.store.clearCart();
        },
        error: (err) => {
          this.showError('Failed to place order. Please try again.');
          console.error('Checkout error:', err);
        }
      });
  }

  getItemTotal(item: CartItem): number {
    const price = parseFloat(item.price as string) || 0;
    return price * item.qty;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
