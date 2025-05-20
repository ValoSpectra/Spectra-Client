import { CurrencyPipe, TitleCasePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { ElectronService } from "../services/electron.service";

@Component({
  selector: "app-supportus",
  imports: [
    ButtonModule,
    FormsModule,
    FloatLabelModule,
    PasswordModule,
    ToastModule,
    ProgressSpinnerModule,
    TitleCasePipe,
    CurrencyPipe,
    CardModule,
  ],
  templateUrl: "./supportus.component.html",
  styleUrl: "./supportus.component.css",
})
export class SupportusComponent {
  protected key: string = "";

  protected loading: boolean = false;
  protected loggedIn: boolean = false;
  protected loggedInOrg: OrgInfo = { id: "", name: "Loading..." };
  protected packagesReady: boolean = false;

  protected sortedPackages: Map<string, Package[]> = new Map<string, Package[]>();

  constructor(
    protected http: HttpClient,
    protected messageService: MessageService,
    protected electronService: ElectronService,
  ) {}

  protected tryLogIn() {
    if (!this.key || this.key.length < 1) {
      this.messageService.add({
        severity: "error",
        summary: "Login",
        detail: "Key is required",
        life: 3000,
      });
      return;
    }
    this.loading = true;

    // this.loading = false;
    // this.loggedIn = true;
    // this.loggedInOrg = {
    //   name: "Test Org",
    //   id: "test-org-id",
    //   isSupporting: false,
    // };
    // this.getPackages();
    // return;

    this.http
      .get<OrgInfo>("http://localhost:5101/getOrgForKey", {
        params: {
          key: this.key,
        },
      })
      .subscribe({
        next: (orgInfo) => {
          // this.messageService.add({
          //   severity: "success",
          //   summary: "Login",
          //   detail: `Login successful for ${orgInfo.name}`,
          //   life: 3000,
          // });
          this.loading = false;
          this.loggedIn = true;
          this.loggedInOrg = orgInfo;
          this.getPackages();
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Login",
            detail: "Login failed",
            life: 3000,
          });
          this.loading = false;
        },
      });
  }

  protected getPackages() {
    this.http.get<Package[]>("http://localhost:5101/getSupportPackages").subscribe({
      next: (packages) => {
        this.processPackages(packages);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Login",
          detail: "Fetching packages failed",
          life: 3000,
        });
      },
    });
  }

  protected processPackages(packages: Package[]) {
    this.sortedPackages.clear();
    packages.forEach((pkg) => {
      if (!this.sortedPackages.has(pkg.category.name)) {
        this.sortedPackages.set(pkg.category.name, []);
      }
      pkg.description = pkg.description.replaceAll("<p>", "");
      pkg.description = pkg.description.replaceAll("</p>", "");
      pkg.checkoutUrl += `&userId=${this.loggedInOrg.id}`;
      // pkg.description = pkg.description.replaceAll("<br />", "");
      this.sortedPackages.get(pkg.category.name)?.push(pkg);
    });
    this.packagesReady = true;
  }

  protected manageSubscription() {
    this.electronService.openExternalLink("https://checkout.tebex.io/payment-history/login");
  }

  protected openCheckout(pkg: Package) {
    this.electronService.openExternalLink(pkg.checkoutUrl);
  }
}

export type OrgInfo = {
  name: string;
  id: string;
  isSupporting?: boolean;
};

export interface Category {
  id: number;
  name: string;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  image: string;
  type: string;
  category: Category;
  base_price: number;
  sales_tax: number;
  total_price: number;
  currency: string;
  discount: number;
  disable_quantity: boolean;
  disable_gifting: boolean;
  expiration_date?: Date;
  created_at: string;
  updated_at: string;
  order: number;
  // We add this on the server
  checkoutUrl: string;
}
