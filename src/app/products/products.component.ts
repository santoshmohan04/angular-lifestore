import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  signal,
} from "@angular/core";
import { SharedService } from "../services/shared.services";
import { Products } from "../data/product.data";
import { AlertMessageService } from "../alerts/alertmsg.service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayTemplate = signal<TemplateRef<string>>(null);
  prodlist: any = "";
  cam: any = "";
  st: any = "";
  wt: any = "";
  smph: any = "";

  @ViewChild("spinner") private spinner: TemplateRef<string>;
  @ViewChild("productstemp") private productstemp: TemplateRef<string>;

  constructor(
    private alertMsg: AlertMessageService,
    private shareService: SharedService
  ) {}

  ngOnInit() {
    let prod_data = localStorage.getItem("prodList");
    console.log("prod_data >>> ", prod_data);
    if (prod_data) {
      this.prodlist = JSON.parse(prod_data);
      this.cam = this.prodlist.cameras;
      this.st = this.prodlist.shirts;
      this.wt = this.prodlist.watches;
      this.smph = this.prodlist.smartphones;
      this.displayTemplate.set(this.productstemp);
    } else {
      this.productList();
    }
  }

  ngAfterViewInit(): void {
    this.displayTemplate.set(this.spinner);
  }

  productList() {
    this.shareService.getProductList().subscribe({
      next: (responseData: Products) => {
        localStorage.setItem("prodList", JSON.stringify(responseData));
        this.prodlist = responseData;
        this.cam = this.prodlist.cameras;
        this.st = this.prodlist.shirts;
        this.wt = this.prodlist.watches;
        this.smph = this.prodlist.smartphones;
        this.displayTemplate.set(this.productstemp);
      },
      error: (err: any) => {
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
        if (responseData.hasOwnProperty("name")) {
          this.alertMsg.alertSuccess("Added to Cart");
        }
      },
    });
  }
}
