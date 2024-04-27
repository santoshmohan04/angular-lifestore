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
import { CommonState } from "../store/common.reducers";
import * as commonactions from "src/app/store/common.actions"

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  displayTemplate = signal<TemplateRef<string>>(null);
  prodlist: Products;
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild("spinner") private spinner: TemplateRef<string>;
  @ViewChild("productstemp") private productstemp: TemplateRef<string>;

  constructor(
    private alertMsg: AlertMessageService,
    private store: Store<{ commondata: CommonState }>
  ) {}

  ngOnInit() {
    this.store.dispatch(commonactions.ProductsPageActions.fetchProducts());
      this.productList();
  }

  ngAfterViewInit(): void {
    this.displayTemplate.set(this.spinner);
  }

  productList() {
    this.store.select('commondata').pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if(res.productslist){
        this.prodlist = res.productslist;
        this.displayTemplate.set(this.productstemp);
      } else if(res.error){
        console.log(res.error);
        this.alertMsg.alertDanger(res.error);
      }
    })
  }

  addtoCart(i: number, action: string) {
    let cust_data = {
      camera: {
        id: this.prodlist.cameras[i].id,
        image: this.prodlist.cameras[i].image,
        name: this.prodlist.cameras[i].name,
        price: this.prodlist.cameras[i].price,
        qty: 0,
        totalamt: 0,
      },
      watch: {
        id: this.prodlist.watches[i].id,
        image: this.prodlist.watches[i].image,
        name: this.prodlist.watches[i].name,
        price: this.prodlist.watches[i].price,
        qty: 0,
        totalamt: 0,
      },
      shirt: {
        id: this.prodlist.shirts[i].id,
        image: this.prodlist.shirts[i].image,
        name: this.prodlist.shirts[i].name,
        price: this.prodlist.shirts[i].price,
        qty: 0,
        totalamt: 0,
      },
      smartphone: {
        id: this.prodlist.smartphones[i].id,
        image: this.prodlist.smartphones[i].image,
        name: this.prodlist.smartphones[i].name,
        price: this.prodlist.smartphones[i].price,
        qty: 0,
        totalamt: 0,
      },
    };
    this.store.dispatch(commonactions.ProductsPageActions.addProductToCart({payload: cust_data[action]}));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
