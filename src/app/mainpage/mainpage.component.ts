import { Component, OnInit } from '@angular/core';
import { ProductCategories, Productcatagory } from '../data/product.data';

@Component({
    selector: 'app-mainpage',
    templateUrl: './mainpage.component.html',
    styleUrls: ['./mainpage.component.css'],
    standalone: false
})
export class MainpageComponent implements OnInit {
  products: ProductCategories[];

  constructor(private prod_cat: Productcatagory) {}

  ngOnInit(): void {
    this.products = this.prod_cat.prod_cat;
  }
}
