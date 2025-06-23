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
import { InputNumberModule } from "primeng/inputnumber";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";

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
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
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

  protected prizepool: number = 500;

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

    this.http
      .get<OrgInfo>("https://eu-extras.valospectra.com/getOrgForKey", {
        params: {
          key: this.key,
        },
      })
      .subscribe({
        next: (orgInfo) => {
          this.loading = false;
          this.loggedIn = true;
          this.loggedInOrg = orgInfo;
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
    this.http.get<Package[]>("https://eu-extras.valospectra.com/getSupportPackages").subscribe({
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

  DISCORD_REDIRECT_URI = "https://eu.valospectra.com:5101/client/oauth-callback";

  protected discordLogin() {
    this.loading = true;
    this.electronService.openExternalLink(
      `https://discord.com/oauth2/authorize?response_type=code&redirect_uri=${encodeURIComponent(this.DISCORD_REDIRECT_URI)}&scope=identify&client_id=1296902430503604264`,
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

  protected jumpToSuggestion() {
    if (this.prizepool <= 350) {
      this.scrollToPanel(`category-${0}`);
    } else if (this.prizepool <= 700) {
      this.scrollToPanel(`category-${1}`);
    } else if (this.prizepool < 1500) {
      this.scrollToPanel(`category-${2}`);
    } else if (this.prizepool < 4500) {
      this.scrollToPanel(`category-${3}`);
    } else {
      this.scrollToPanel(`custom-arrangement`);
    }
  }

  private scrollToPanel(id: string) {
    const element = document.getElementById(id);
    if (!element) return;

    const box = element.getBoundingClientRect();
    if (!box) return;

    window.scrollTo({
      top: box.top + window.scrollY,
      left: box.left + window.scrollX,
      behavior: "smooth",
    });
    element.classList.add("animate-[pulse_0.5s_3]");
    setTimeout(() => {
      element.classList.remove("animate-[pulse_0.5s_3]");
    }, 1500);
  }

  protected openDiscordInvite() {
    this.electronService.openExternalLink("https://discord.gg/nWWXqqK6tz");
  }
}

export type OrgInfo = {
  name: string;
  id: string;
  isSupporter?: boolean;
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
