import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { LoadingOverlayComponent } from "./loading-overlay/loading-overlay.component";
import { HeaderComponent } from "./header/header.component";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: true,
    imports: [RouterModule, LoadingOverlayComponent, HeaderComponent]
})
export class AppComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    // this.authService.autoLogin();
  }
}
