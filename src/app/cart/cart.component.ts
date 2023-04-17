import { Component, OnInit } from '@angular/core';
import { AlertMessageService } from '../alerts/alertmsg.service';
import { SharedService } from '../services/shared.services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartKeys: any = [];
  cartValues: any = [];
  total: number = 0;
  ordmsg: string = '';
  ordDate = new Date();

  constructor(
    private datepipe: DatePipe,
    private alertMsg: AlertMessageService,
    private shareService: SharedService
  ) {}

  ngOnInit(): void {
    this.cartItems();
  }

  cartItems() {
    this.shareService.getCartItems().subscribe({
      next: (responseData) => {
        if (responseData) {
          this.cartKeys = Object.keys(responseData);
          this.cartValues = Object.values(responseData);
          this.cartValues.forEach((t: any) => {
            this.total += parseFloat(t.price);
          });
        }
      },
      error: (err: any) => {
        this.alertMsg.alertDanger(err);
      },
    });
  }

  rmCart(x: any) {
    const index = this.cartValues.indexOf(x);
    this.cartValues.splice(index, 1);
    this.total = this.total - x.price;
    let cartid = this.cartKeys.at(index);
    this.shareService.removeCartItems(cartid).subscribe({
      next: (responseData) => {
        if (responseData == null) {
          this.alertMsg.alertInfo('Removed from Cart');
        }
      },
      error: (err: any) => {
        this.alertMsg.alertDanger(err);
      },
    });
  }

  conformOrd() {
    let ordData = {
      items: this.cartValues,
      orddate: this.datepipe.transform(this.ordDate, 'medium'),
    };
    this.shareService.conformOrder(ordData).subscribe({
      next: (responseData) => {
        if (responseData.hasOwnProperty('name') === true) {
          this.shareService.clearCart().subscribe({
            next: (responseData) => {
              if (responseData == null) {
                this.cartKeys = [];
                this.cartValues = [];
                this.total = 0;
                this.ordmsg =
                  'Your order is confirmed. Thank you for shopping with us.';
              }
            },
            error: (err: any) => {
              console.log('err in clearCart >>> ', err);
              this.alertMsg.alertDanger(err);
            },
          });
        }
      },
      error: (err: any) => {
        console.log('err in conformOrd >>> ', err);
        this.alertMsg.alertDanger(err);
      },
    });
  }

  clearCart() {
    this.shareService.clearCart().subscribe({
      next: (responseData) => {
        if (responseData === null) {
          this.cartKeys = [];
          this.cartValues = [];
          this.total = 0;
          this.ordmsg = '';
        }
      },
      error: (err: any) => {
        console.log('err in clearCart >>> ', err);
        this.alertMsg.alertDanger(err);
      },
    });
  }
}
