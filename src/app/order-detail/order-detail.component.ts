import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { SharedService } from '../services/shared.services';
import { SnackbarService } from '../services/snackbar.service';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number | string;
  image: string;
}

interface OrderDetail {
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
    email?: string;
    phone?: string;
  };
  subtotal?: number;
  tax?: number;
  shipping?: number;
  paymentMethod?: string;
  trackingNumber?: string;
}

interface TimelineStep {
  label: string;
  date?: string;
  completed: boolean;
  icon: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  // Services
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sharedService = inject(SharedService);
  private readonly snackbar = inject(SnackbarService);

  // State
  order = signal<OrderDetail | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Table columns
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total'];

  // Computed
  hasOrder = computed(() => this.order() !== null);
  timeline = computed(() => this.getOrderTimeline());

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    } else {
      this.error.set('Order ID not found');
      this.isLoading.set(false);
    }
  }

  loadOrderDetail(orderId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // First try to get all orders and find the specific one
    this.sharedService.getUserOrders().subscribe({
      next: (response: any) => {
        const ordersData = Array.isArray(response) 
          ? response 
          : Object.values(response || {});

        const orderData = ordersData.find((o: any) => 
          (o.id === orderId || o._id === orderId || o.orderNumber === orderId)
        );

        if (orderData) {
          this.order.set(this.transformOrder(orderData));
        } else {
          this.error.set('Order not found');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load order details');
        this.snackbar.showError('Failed to load order details');
        this.isLoading.set(false);
      },
    });
  }

  private transformOrder(orderData: any): OrderDetail {
    const total = orderData.total || 0;
    const subtotal = orderData.subtotal || total * 0.847;
    const tax = orderData.tax || total * 0.153;
    const shipping = orderData.shipping || 50;

    return {
      id: orderData.id || orderData._id || '',
      orderNumber: orderData.orderNumber || `ORD-${orderData.id?.slice(-8) || Math.random().toString().slice(-8)}`,
      date: orderData.date || orderData.createdAt || new Date(),
      total,
      status: orderData.status || 'pending',
      items: Array.isArray(orderData.items) 
        ? orderData.items 
        : Object.values(orderData.items || {}),
      shippingAddress: orderData.shippingAddress,
      subtotal,
      tax,
      shipping,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      trackingNumber: orderData.trackingNumber,
    };
  }

  getOrderTimeline(): TimelineStep[] {
    const orderData = this.order();
    if (!orderData) return [];

    const status = orderData.status;
    const orderDate = new Date(orderData.date);

    const steps: TimelineStep[] = [
      {
        label: 'Order Placed',
        date: this.formatDate(orderDate),
        completed: true,
        icon: 'check_circle',
      },
      {
        label: 'Processing',
        date: status !== 'pending' ? this.formatDate(this.addDays(orderDate, 1)) : undefined,
        completed: ['processing', 'shipped', 'delivered'].includes(status),
        icon: 'autorenew',
      },
      {
        label: 'Shipped',
        date: ['shipped', 'delivered'].includes(status) ? this.formatDate(this.addDays(orderDate, 2)) : undefined,
        completed: ['shipped', 'delivered'].includes(status),
        icon: 'local_shipping',
      },
      {
        label: 'Delivered',
        date: status === 'delivered' ? this.formatDate(this.addDays(orderDate, 5)) : undefined,
        completed: status === 'delivered',
        icon: 'done_all',
      },
    ];

    if (status === 'cancelled') {
      return [
        steps[0],
        {
          label: 'Cancelled',
          date: this.formatDate(this.addDays(orderDate, 1)),
          completed: true,
          icon: 'cancel',
        },
      ];
    }

    return steps;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
    });
  }

  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  downloadInvoice(): void {
    const orderData = this.order();
    if (!orderData) return;

    // Navigate to invoice page for print/download
    this.router.navigate(['/invoice', orderData.id]);
  }

  private generateInvoiceHTML(order: OrderDetail): string {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">$${typeof item.price === 'string' ? item.price : item.price.toFixed(2)}</td>
        <td style="text-align: right;">$${this.getItemTotal(item).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1976d2; margin: 0; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .totals { margin-top: 20px; text-align: right; }
    .totals table { width: 300px; margin-left: auto; }
    .total-row { font-weight: bold; font-size: 1.2em; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>Lifestyle Store</p>
  </div>

  <div class="invoice-info">
    <div>
      <strong>Invoice #:</strong> ${order.orderNumber}<br>
      <strong>Date:</strong> ${this.formatDate(order.date)}<br>
      <strong>Status:</strong> ${order.status.toUpperCase()}
    </div>
    ${order.shippingAddress ? `
    <div>
      <strong>Ship To:</strong><br>
      ${order.shippingAddress.fullName}<br>
      ${order.shippingAddress.addressLine1}<br>
      ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">$${order.subtotal?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>Tax (18%):</td>
        <td style="text-align: right;">$${order.tax?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>Shipping:</td>
        <td style="text-align: right;">$${order.shipping?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td style="text-align: right;">$${order.total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>For questions about this invoice, please contact support@lifestylestore.com</p>
  </div>
</body>
</html>
    `.trim();
  }

  printInvoice(): void {
    window.print();
  }

  trackOrder(): void {
    const orderData = this.order();
    if (orderData?.trackingNumber) {
      this.snackbar.showSuccess(`Tracking: ${orderData.trackingNumber}`);
    } else {
      this.snackbar.showSuccess('Tracking information will be available soon');
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
