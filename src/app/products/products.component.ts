import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.services';
import { Products } from '../data/product.data';
import { AlertMessageService } from '../alerts/alertmsg.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  prodlist: any = '';
  cam: any = '';
  st: any = '';
  wt: any = '';
  smph: any = '';
  isLoading = false;

  constructor(
    private alertMsg: AlertMessageService,
    private shareService: SharedService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    let prod_data = localStorage.getItem('prodList');
    if (prod_data) {
      this.isLoading = false;
      this.prodlist = JSON.parse(prod_data);
      this.cam = this.prodlist.cameras;
      this.st = this.prodlist.shirts;
      this.wt = this.prodlist.watches;
      this.smph = this.prodlist.smartphones;
    } else {
      this.productList();
    }
  }

  productList() {
    this.isLoading = true;
    this.shareService.getProductList().subscribe({
      next: (responseData: Products) => {
        this.isLoading = false;
        localStorage.setItem('prodList', JSON.stringify(responseData));
        this.prodlist = responseData;
        this.cam = this.prodlist.cameras;
        this.st = this.prodlist.shirts;
        this.wt = this.prodlist.watches;
        this.smph = this.prodlist.smartphones;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.alertMsg.alertDanger(err);
      },
    });
  }

  addtoCart(i: number, action: string) {
    let cust_data = {
      camera: {
        id: this.cam[i].id,
        image: this.cam[i].image,
        name: this.cam[i].name,
        price: this.cam[i].price,
      },
      watch: {
        id: this.wt[i].id,
        image: this.wt[i].image,
        name: this.wt[i].name,
        price: this.wt[i].price,
      },
      shirt: {
        id: this.st[i].id,
        image: this.st[i].image,
        name: this.st[i].name,
        price: this.st[i].price,
      },
      smartphone: {
        id: this.smph[i].id,
        image: this.smph[i].image,
        name: this.smph[i].name,
        price: this.smph[i].price,
      },
    };
    this.shareService.addToCart(cust_data[action]).subscribe({
      next: (responseData) => {
        if (responseData.hasOwnProperty('name')) {
          this.alertMsg.alertSuccess('Added to Cart');
        }
      },
    });
  }
}
