import {
  Component,
  OnDestroy,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatChipsModule } from "@angular/material/chips";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Products, Prodinfo } from "../data/product.data";
import { Subject, takeUntil } from "rxjs";
import { CartStore } from "../store/cart.store";
import { SharedService } from "../services/shared.services";
import { SnackbarService } from "../services/snackbar.service";

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type CategoryKey = 'cameras' | 'watches' | 'shirts' | 'smartphones';

@Component({
    selector: "app-products",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.scss"],
    standalone: true,
    imports: [
      CommonModule,
      MatSidenavModule,
      MatListModule,
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatSelectModule,
      MatFormFieldModule,
      MatProgressSpinnerModule,
      MatChipsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit, OnDestroy {
  // Signals for state management
  selectedCategory = signal<CategoryKey>('cameras');
  sortOption = signal<SortOption>('name-asc');
  prodlist = signal<Products | null>(null);
  isLoading = signal<boolean>(true);
  isMobile = signal<boolean>(false);
  
  // Computed filtered and sorted products
  displayedProducts = computed(() => {
    const products = this.prodlist();
    const category = this.selectedCategory();
    const sort = this.sortOption();
    
    if (!products || !products[category]) return [];
    
    let items = [...products[category]];
    
    // Apply sorting
    switch (sort) {
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        items.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
        break;
      case 'price-desc':
        items.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
        break;
    }
    
    return items;
  });
  
  categories = [
    { key: 'cameras' as CategoryKey, name: 'Cameras', icon: 'camera_alt' },
    { key: 'watches' as CategoryKey, name: 'Watches', icon: 'watch' },
    { key: 'shirts' as CategoryKey, name: 'Shirts', icon: 'checkroom' },
    { key: 'smartphones' as CategoryKey, name: 'Smartphones', icon: 'smartphone' }
  ];
  
  sortOptions = [
    { value: 'name-asc' as SortOption, label: 'Name (A-Z)' },
    { value: 'name-desc' as SortOption, label: 'Name (Z-A)' },
    { value: 'price-asc' as SortOption, label: 'Price (Low to High)' },
    { value: 'price-desc' as SortOption, label: 'Price (High to Low)' }
  ];
  
  private destroy$ = new Subject<boolean>();
  
  // Inject stores and services
  readonly cartStore = inject(CartStore);

  constructor(
    private readonly sharedService: SharedService,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private snackbar: SnackbarService
  ) {
    // Detect mobile devices
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  ngOnInit() {
    this.productList();
    
    // Check for category from route query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        const category = params['category'].toLowerCase();
        const categoryMap: Record<string, CategoryKey> = {
          'cameras': 'cameras',
          'watches': 'watches',
          'shirts': 'shirts',
          'smartphones': 'smartphones'
        };
        if (categoryMap[category]) {
          this.selectedCategory.set(categoryMap[category]);
        }
      }
    });
  }

  productList() {
    this.sharedService.getProductList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.prodlist.set(products);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.snackbar.showError(error.message || 'Failed to load products');
          this.isLoading.set(false);
        }
      });
  }

  selectCategory(category: CategoryKey): void {
    this.selectedCategory.set(category);
  }
  
  updateSort(sort: SortOption): void {
    this.sortOption.set(sort);
  }

  addtoCart(data: Prodinfo): void {
    if (!data.id) {
      this.snackbar.showError('Product ID is missing. Cannot add to cart.');
      return;
    }
    
    const add_payload = {
      productId: data.id,
      quantity: 1
    };
    this.cartStore.addItem(add_payload);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
