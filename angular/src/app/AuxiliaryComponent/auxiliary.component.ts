import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { ElectronService } from "../services/electron.service";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TagModule } from "primeng/tag";
import { LocalstorageService } from "../services/localstorage.service";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-auxiliary",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    SelectModule,
    ToggleSwitchModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: "./auxiliary.component.html",
  styleUrl: "./auxiliary.component.css",
})
export class AuxiliaryComponent {
  protected darkModeEnabled: boolean = false;

  constructor(
    protected electron: ElectronService,
    protected localStorageService: LocalstorageService,
  ) {
    this.darkModeEnabled = this.localStorageService.getItem<boolean>("darkMode") || true;
    if (this.darkModeEnabled) {
      const element = document.querySelector("html");
      element!.classList.add("dark");
    }
  }

  protected ingestServerOptions: string[] = ["eu.valospectra.com", "na.valospectra.com"];
  protected ingestServerIp: string | undefined = undefined;

  // this.electron.processInputs(
  //   this.ingestServerIp,
  //   this.groupCode,
  //   "Tiranthine",
  //   {
  //     ...this.leftTeamInfo,
  //     attackStart: false,
  //   },
  //   {
  //     ...this.rightTeamInfo,
  //     attackStart: true,
  //   },
  //   this.key,
  //   seriesInfo,
  //   seedingInfo,
  //   emptyTournamentInfo,
  //   hotkeys,
  //   60,
  // );
  // }

  protected toggleDarkMode() {
    const element = document.querySelector("html");
    element!.classList.toggle("dark");
    this.darkModeEnabled = !this.darkModeEnabled;
    this.localStorageService.setItem("darkMode", this.darkModeEnabled);
  }
}
