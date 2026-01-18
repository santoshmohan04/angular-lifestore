import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../services/shared.services';

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sharedService = inject(SharedService);

  order = signal<Order | null>(null);
  invoiceDate = signal<Date>(new Date());
  companyInfo = {
    name: 'LifeStore',
    address: '123 Commerce Street',
    city: 'San Francisco, CA 94102',
    phone: '(555) 123-4567',
    email: 'support@lifestore.com',
    website: 'www.lifestore.com',
    taxId: 'TAX-123456789'
  };

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  loadOrder(orderId: string): void {
    // Simulate loading order from service
    // In a real app, this would call this.sharedService.getOrderById(orderId)
    const mockOrder: Order = {
      id: orderId,
      orderNumber: `ORD-${orderId.slice(0, 8).toUpperCase()}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: 'Delivered',
      items: [
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 199.99,
          quantity: 1,
          image: 'assets/Images/headphones.jpg'
        },
        {
          id: '2',
          name: 'Smart Watch Pro',
          price: 349.99,
          quantity: 1,
          image: 'assets/Images/watch.jpg'
        },
        {
          id: '3',
          name: 'Portable Charger 20000mAh',
          price: 49.99,
          quantity: 2,
          image: 'assets/Images/charger.jpg'
        }
      ],
      subtotal: 649.96,
      tax: 58.50,
      shipping: 15.00,
      total: 723.46,
      shippingAddress: {
        fullName: 'John Doe',
        address1: '456 Oak Avenue',
        address2: 'Apt 12B',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States'
      },
      billingAddress: {
        fullName: 'John Doe',
        address1: '456 Oak Avenue',
        address2: 'Apt 12B',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States'
      },
      paymentMethod: 'Credit Card ending in 4242'
    };

    this.order.set(mockOrder);
  }

  printInvoice(): void {
    window.print();
  }

  downloadPDF(): void {
    // Trigger browser print dialog which allows saving as PDF
    window.print();
  }

  goBack(): void {
    const order = this.order();
    if (order) {
      this.router.navigate(['/orders', order.id]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  getItemTotal(item: OrderItem): number {
    return item.price * item.quantity;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
