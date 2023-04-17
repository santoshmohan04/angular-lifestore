import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';
import { SharedService } from '../services/shared.services';
import { AlertMessageService } from '../alerts/alertmsg.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  cartKeys: any = [];
  cartValues: any = [];
  total: number = 0;
  ordmsg: string = '';
  ordDate = new Date();
  isLoading = false;
  isCollapsed = false;
  userEmail: string = '';
  @ViewChild('logout') logout: NgbModal;

  constructor(
    private datepipe: DatePipe,
    private alertMsg: AlertMessageService,
    private authService: AuthService,
    private modalService: NgbModal,
    private shareService: SharedService
  ) {}

  ngOnInit(): void {
    this.authService.getUserInfo();
    this.authService.user.subscribe({
      next: (value) => {
        let user_data = value;
        this.userEmail = user_data?.email;
        user_data
          ? (this.isAuthenticated = true)
          : (this.isAuthenticated = false);
      },
      error: (err) => {
        this.alertMsg.alertDanger(err);
      },
    });
    console.log(this.isAuthenticated);
  }

  openVerticallyCentered(content) {
    if (content === 'mycart') {
      this.cartItems();
      this.modalService.open(content, { size: 'xl' });
    } else {
      this.modalService.open(content, { size: 'lg' });
    }
  }

  cartItems() {
    this.shareService.getCartItems().subscribe({
      next: (responseData) => {
        console.log(responseData);
        this.cartKeys = Object.keys(responseData);
        this.cartValues = Object.values(responseData);
        for (let j = 0; j < this.cartValues.length; j++) {
          this.total += parseFloat(this.cartValues[j].price);
        }
      },
      error: (err: any) => {
        console.log('err in getCartItems >>> ', err);
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
        console.log('err in removeCartItems >>> ', err);
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
                this.cartKeys = false;
                this.ordmsg =
                  'Your order is confirmed. Thank you for shopping with us.';
                this.modalService.dismissAll();
              }
            },
            error: (err: any) => {
              console.log('err in clearCart >>> ', err);
            },
          });
        }
      },
      error: (err: any) => {
        console.log('err in conformOrd >>> ', err);
      },
    });
  }

  onLogout() {
    this.modalService.dismissAll();
    this.authService.logout();
  }
}
