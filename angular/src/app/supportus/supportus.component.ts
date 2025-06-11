import { CurrencyPipe, TitleCasePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { ElectronService } from "../services/electron.service";
import { LocalstorageService } from "../services/localstorage.service";
import { AvatarModule } from "primeng/avatar";
import { DialogModule } from "primeng/dialog";

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
    AvatarModule,
    DialogModule,
  ],
  templateUrl: "./supportus.component.html",
  styleUrl: "./supportus.component.css",
})
export class SupportusComponent implements OnInit {
  protected key: string = "";

  protected loading: boolean = false;
  protected loggedIn: boolean = false;
  protected loggedInOrg: OrgInfo = { id: "", name: "Loading..." };
  protected loggedInDiscord: DiscordInfo = {
    userId: "",
    username: "Not logged in",
    avatarHash: "",
  };
  protected packagesReady: boolean = false;
  protected displayCloseTab: boolean = false;

  protected sortedPackages: Map<string, Package[]> = new Map<string, Package[]>();

  constructor(
    protected http: HttpClient,
    protected messageService: MessageService,
    protected electronService: ElectronService,
    protected localstorageService: LocalstorageService,
  ) {}

  ngOnInit(): void {
    this.getPackages();
    window.addEventListener("storage", (event) => {
      if (event.key === "discordInfo") {
        if (event.newValue != null) {
          this.loggedInDiscord = JSON.parse(event.newValue);
          this.displayCloseTab = true;
        }
      }
    });
    this.loggedInDiscord = this.localstorageService.getItem<DiscordInfo>("discordInfo") || {
      userId: "",
      username: "Not logged in",
      avatarHash: "",
    };
  }

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
          this.loading = false;
          this.loggedIn = true;
          this.loggedInOrg = orgInfo;
          this.loggedInOrg.isSupporting = false;
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

      this.sortedPackages.get(pkg.category.name)?.push(pkg);
    });
    this.packagesReady = true;
  }

  protected manageSubscription() {
    this.electronService.openExternalLink("https://checkout.tebex.io/payment-history/login");
  }

  protected openCheckout(pkg: Package) {
    const userId = this.loggedInOrg.id || `user-${this.loggedInDiscord.userId}`;
    pkg.checkoutUrl += `&userId=${userId}`;
    if (this.loggedInDiscord.userId && this.loggedInDiscord.userId != "") {
      pkg.checkoutUrl += `&discordId=${this.loggedInDiscord.userId}`;
    }

    console.log(pkg.checkoutUrl);
    this.electronService.openExternalLink(pkg.checkoutUrl);
  }

  protected orgLogout() {
    this.loggedIn = false;
    this.loggedInOrg = { id: "", name: "Loading..." };
  }

  protected discordLogin() {
    this.loading = true;
    this.electronService.openExternalLink(
      "https://discord.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5101%2Fclient%2Foauth-callback&scope=identify&client_id=1296902430503604264",
    );
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  protected clearDiscordLogin() {
    this.localstorageService.removeItem("discordInfo");
    this.loggedInDiscord = {
      userId: "",
      username: "Not logged in",
      avatarHash: "",
    };
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

export interface DiscordInfo {
  userId: string;
  username: string;
  avatarHash: string;
}
