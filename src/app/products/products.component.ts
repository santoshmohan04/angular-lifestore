import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  signal,
} from "@angular/core";
import { Products } from "../data/product.data";
import { AlertMessageService } from "../alerts/alertmsg.service";
import { Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import * as commonactions from "src/app/store/common.actions"
import { selectCommonStatus } from "../store/common.selectors";

@Component({
    selector: "app-products",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.css"],
    standalone: false
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  active = 'cameras';
  displayTemplate = signal<TemplateRef<string>>(null);
  prodlist: Products;
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild("spinner") private readonly spinner: TemplateRef<string>;
  @ViewChild("productstemp") private readonly productstemp: TemplateRef<string>;

  constructor(
    private readonly alertMsg: AlertMessageService,
    private readonly store: Store
  ) { }

  ngOnInit() {
    this.store.dispatch(commonactions.ProductsPageActions.fetchProducts());
    this.productList();
  }

  ngAfterViewInit(): void {
    this.displayTemplate.set(this.spinner);
  }

  productList() {
    this.store.select(selectCommonStatus).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res.productslist) {
        this.prodlist = res.productslist;
        this.displayTemplate.set(this.productstemp);
      } else if (res.error) {
        this.alertMsg.alertDanger(res.error);
      }
    })
  }

  addtoCart(data: any) {
    const add_payload = {
      ...data, qty: 1,
      totalamt: data.price,
    }
    this.store.dispatch(commonactions.ProductsPageActions.addProductToCart({ payload: add_payload }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
