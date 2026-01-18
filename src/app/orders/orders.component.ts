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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { SharedService } from '../services/shared.services';
import { SnackbarService } from '../services/snackbar.service';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number | string;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string | Date;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  // Services
  private readonly sharedService = inject(SharedService);
    private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);

  // State
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Computed
  hasOrders = computed(() => this.orders().length > 0);
  totalOrders = computed(() => this.orders().length);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.sharedService.getUserOrders().subscribe({
      next: (response: any) => {
        // Handle both array and object responses
        const ordersData = Array.isArray(response) 
          ? response 
          : Object.values(response || {});

        // Transform and sort orders
        const transformedOrders = ordersData
          .map((order: any) => this.transformOrder(order))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.orders.set(transformedOrders);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load orders');
        this.snackbar.showError('Failed to load orders');
        this.isLoading.set(false);
      },
    });
  }

  private transformOrder(orderData: any): Order {
    return {
      id: orderData.id || orderData._id || `order-${Date.now()}`,
      orderNumber: orderData.orderNumber || `ORD-${orderData.id?.slice(-8) || Math.random().toString().slice(-8)}`,
      date: orderData.date || orderData.createdAt || new Date(),
      total: orderData.total || 0,
      status: orderData.status || 'pending',
      items: Array.isArray(orderData.items) 
        ? orderData.items 
        : Object.values(orderData.items || {}),
      shippingAddress: orderData.shippingAddress,
    };
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'warn',
      processing: 'primary',
      shipped: 'accent',
      delivered: 'primary',
      cancelled: 'warn',
    };
    return colors[status] || 'primary';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      processing: 'autorenew',
      shipped: 'local_shipping',
      delivered: 'check_circle',
      cancelled: 'cancel',
    };
    return icons[status] || 'receipt';
  }

  getItemTotal(item: OrderItem): number {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return (price || 0) * (item.quantity || 1);
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  viewOrderDetails(order: Order): void {
    // Navigate to order details page
    this.router.navigate(['/orders', order.id]);
  }

  reorder(order: Order): void {
    // Add all items from the order back to cart
    this.snackbar.showSuccess('Items added to cart!');
    this.router.navigate(['/cart']);
  }

  trackOrder(order: Order): void {
    // Track order functionality (can be implemented later)
    this.snackbar.showSuccess(`Tracking order ${order.orderNumber}`);
  }
}
