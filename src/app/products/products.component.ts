import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  prodlist:any = "";
  cam:any = "";
  st:any = "";
  wt:any = "";
  smph:any = "";
  id:any = "";
  image:any = "";
  name:any = "";
  price:any = "";

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  ngOnInit() {
    this.http
      .get(
        'https://e-store-23dd9.firebaseio.com/prodlist.json'
      )
      .subscribe((responseData) => {
        this.prodlist = responseData
        this.cam = this.prodlist.cameras;
        this.st = this.prodlist.shirts;
        this.wt = this.prodlist.watches;
        this.smph = this.prodlist.smartphones;
        console.log(responseData);
      });
  }

  cameraCart(i) {
    console.log(i);
    this.id = this.cam[i].id;
    this.image = this.cam[i].image;
    this.name = this.cam[i].name;
    this.price = this.cam[i].price;
    let cartData = { id: this.id, image: this.image, name: this.name, price: this.price }
    this.http.post('https://e-store-23dd9.firebaseio.com/cartitems.json', cartData)
    .subscribe((responseData) => {
      if(responseData.hasOwnProperty('name')) {
        alert('Added to Cart');
      }
    });
  }

  watchCart(i) {
    console.log(i);
    this.id = this.wt[i].id;
    this.image = this.wt[i].image;
    this.name = this.wt[i].name;
    this.price = this.wt[i].price;
    let cartData = { id: this.id, image: this.image, name: this.name, price: this.price }
    this.http.post('https://e-store-23dd9.firebaseio.com/cartitems.json', cartData)
    .subscribe((responseData) => {
      if(responseData.hasOwnProperty('name')) {
        alert('Added to Cart');
      }
    });
  }

  shirtsCart(i) {
    console.log(i);
    this.id = this.st[i].id;
    this.image = this.st[i].image;
    this.name = this.st[i].name;
    this.price = this.st[i].price;
    let cartData = { id: this.id, image: this.image, name: this.name, price: this.price }
    this.http.post('https://e-store-23dd9.firebaseio.com/cartitems.json', cartData)
    .subscribe((responseData) => {
      if(responseData.hasOwnProperty('name')) {
        alert('Added to Cart');
      }
    });
  }

  smCart(i) {
    console.log(i);
    this.id = this.smph[i].id;
    this.image = this.smph[i].image;
    this.name = this.smph[i].name;
    this.price = this.smph[i].price;
    let cartData = { id: this.id, image: this.image, name: this.name, price: this.price }
    this.http.post('https://e-store-23dd9.firebaseio.com/cartitems.json', cartData)
    .subscribe((responseData) => {
      if(responseData.hasOwnProperty('name')) {
        alert('Added to Cart');
      }
    });
  }

}
