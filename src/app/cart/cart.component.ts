import {
  Component,
  OnInit,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatBadgeModule } from "@angular/material/badge";
import { CartStore } from "../store/cart.store";
import { SnackbarService } from "../services/snackbar.service";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string | number;
  image: string;
  qty: number;
  quantity?: number;
  totalamt?: string | number;
}

@Component({
    selector: "app-cart",
    templateUrl: "./cart.component.html",
    styleUrls: ["./cart.component.scss"],
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatDividerModule,
      MatListModule,
      MatProgressSpinnerModule,
      MatBadgeModule
    ],
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  // Inject CartStore
  readonly cartStore = inject(CartStore);
  
  // Access store signals
  cartItems = this.cartStore.items;
  isLoading = this.cartStore.loading;
  
  // Computed signals from store
  hasItems = computed(() => this.cartItems().length > 0);
  itemCount = this.cartStore.totalItems;
  subtotal = this.cartStore.totalAmount;
  tax = this.cartStore.tax;
  shipping = this.cartStore.shipping;
  total = this.cartStore.grandTotal;

  constructor(
    private readonly router: Router,
    private readonly snackbar: SnackbarService
  ) {
    // Effect to handle errors
    effect(() => {
      const error = this.cartStore.error();
      if (error) {
        this.snackbar.showError(error);
      }
    });
  }

  ngOnInit(): void {
    this.cartStore.loadCart();
  }

  incrementQuantity(item: CartItem): void {
    this.cartStore.updateQuantity(item.id, item.qty + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.qty > 1) {
      this.cartStore.updateQuantity(item.id, item.qty - 1);
    }
  }

  removeItem(item: CartItem): void {
    this.cartStore.removeItem(item.id);
    this.snackbar.showSuccess('Item removed from cart');
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartStore.clearCart();
      this.snackbar.showSuccess('Cart cleared');
    }
  }

  checkout(): void {
    if (!this.hasItems()) {
      this.snackbar.showError('Your cart is empty');
      return;
    }
    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }

  getItemTotal(item: CartItem): number {
    const price = parseFloat(item.price as string) || 0;
    return price * item.qty;
  }
}
