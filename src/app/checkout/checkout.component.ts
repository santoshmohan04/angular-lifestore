import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartStore } from '../store/cart.store';
import { AuthStore } from '../store/auth.store';
import { SharedService } from '../services/shared.services';
import { ImagePathPipe } from '../pipes/image-path.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ImagePathPipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  // Inject stores and services
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);

  // Forms
  addressForm: FormGroup;

  // State
  isProcessing = signal<boolean>(false);
  orderPlaced = signal<boolean>(false);
  orderNumber = signal<string>('');

  // Computed values from stores
  cartItems = this.cartStore.items;
  subtotal = this.cartStore.totalAmount;
  tax = this.cartStore.tax;
  shipping = this.cartStore.shipping;
  total = this.cartStore.grandTotal;
  itemCount = this.cartStore.totalItems;
  userEmail = this.authStore.userEmail;

  // Check if cart is empty
  hasItems = computed(() => this.cartItems().length > 0);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private snackBar: MatSnackBar
  ) {
    // Initialize form immediately to avoid template errors
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      country: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Redirect to cart if empty
    if (!this.hasItems()) {
      this.router.navigate(['/cart']);
      return;
    }

    // Load cart items
    this.cartStore.loadCart();

    // Set user email in form
    const email = this.userEmail();
    if (email) {
      this.addressForm.patchValue({ email });
    }
  }

  // Get form controls for easy access in template
  get f() {
    return this.addressForm.controls;
  }

  // Calculate item total
  getItemTotal(item: any): number {
    const price = parseFloat(item.price as string) || 0;
    return price * item.qty;
  }

  // Place order
  async placeOrder(): Promise<void> {
    if (!this.addressForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (!this.hasItems()) {
      this.snackBar.open('Your cart is empty', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isProcessing.set(true);

    const items = this.cartItems();
    const orderItems = items.map((item) => ({
      productId: item.productId || item.id,
      quantity: item.qty,
      price: item.price,
      name: item.name,
      image: item.image,
    }));

    const orderData = {
      items: orderItems,
      total: this.total(),
      shippingAddress: this.addressForm.value,
      userEmail: this.userEmail(),
    };

    this.sharedService.conformOrder(orderData).subscribe({
      next: (response: any) => {
        this.isProcessing.set(false);
        this.orderPlaced.set(true);
        
        // Generate order number
        const orderNum = `ORD-${Date.now().toString().slice(-8)}`;
        this.orderNumber.set(orderNum);

        // Clear cart
        this.cartStore.clearCart();

        this.snackBar.open('Order placed successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.snackBar.open(
          error.message || 'Failed to place order. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  // Navigate back to shopping
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  // Navigate to orders
  viewOrders(): void {
    this.router.navigate(['/orders']);
  }
}
