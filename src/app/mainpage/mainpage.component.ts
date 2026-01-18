import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProductCategories, Productcatagory } from '../data/product.data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-mainpage',
    templateUrl: './mainpage.component.html',
    styleUrls: ['./mainpage.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatGridListModule,
      RouterModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainpageComponent implements OnInit {
  products: ProductCategories[];
  columns$: Observable<number>;

  constructor(
    private readonly prod_cat: Productcatagory,
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    // Responsive grid columns based on screen size
    this.columns$ = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          return 1; // Mobile
        } else if (result.breakpoints[Breakpoints.Small]) {
          return 2; // Tablet portrait
        } else if (result.breakpoints[Breakpoints.Medium]) {
          return 3; // Tablet landscape
        } else {
          return 4; // Desktop
        }
      })
    );
  }

  ngOnInit(): void {
    this.products = this.prod_cat.prod_cat;
  }

  navigateToCategory(category: ProductCategories): void {
    // Navigate to products page with optional category filter
    this.router.navigate(['/products'], { 
      queryParams: { category: category.name.toLowerCase() } 
    });
  }
}
