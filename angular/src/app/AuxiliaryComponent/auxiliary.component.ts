import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { ElectronService, Status, StatusTypes } from "../services/electron.service";
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from "primeng/toggleswitch";
import { TagModule } from "primeng/tag";
import { LocalstorageService } from "../services/localstorage.service";
import { ButtonModule } from "primeng/button";
import { TitleCasePipe } from "@angular/common";

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
    TitleCasePipe
  ],
  templateUrl: "./auxiliary.component.html",
  styleUrl: "./auxiliary.component.css",
})
export class AuxiliaryComponent {
  protected spectraStatus: Status = {message: "Initializing", statusType: StatusTypes.NEUTRAL};
  protected darkModeEnabled: boolean = false;

  constructor(
    protected electron: ElectronService,
    protected localStorageService: LocalstorageService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    const loadedDarkModeEnabled = this.localStorageService.getItem<boolean>("darkMode");
    if (loadedDarkModeEnabled !== null) {
      this.darkModeEnabled = loadedDarkModeEnabled;
    } else {
      this.darkModeEnabled = true;
    }
    if (this.darkModeEnabled) {
      const element = document.querySelector("html");
      element!.classList.add("dark");
    }

    const minimizedToTraySettingLoaded = this.localStorageService.getItem<boolean>("auxMinimizedToTraySetting");
    if (minimizedToTraySettingLoaded !== null) {
      this.minimizedToTraySetting = minimizedToTraySettingLoaded;
    } 
    else {
      this.minimizedToTraySetting = true;
    }

    electron.spectraStatusMessage.subscribe((status: Status) => {
      this.spectraStatus = status;
      this.changeDetectorRef.detectChanges();
    });

    electron.fireConnect.subscribe(() => {
      this.connect();
    });

    electron.playernameMessage.subscribe((name: string) => {
      this.playername = name;
      this.changeDetectorRef.detectChanges();
    });

    electron.inputAllowedMessage.subscribe((value: boolean) => {
      this.editable = value;
      this.changeDetectorRef.detectChanges();
    });
  }

  protected ingestServerOptions: string[] = ["EU Server", "NA Server"];
  protected ingestServerIp: string | undefined = undefined;
  protected playername: string = "";
  protected minimizedToTraySetting: boolean = true;

  protected editable: boolean = true;

  protected connect() {
    let ingestIp = this.ingestServerIp!;
    if (ingestIp == this.ingestServerOptions[0]) {
      ingestIp = "eu.valospectra.com";
    }
    else if (ingestIp == this.ingestServerOptions[1]) {
      ingestIp = "na.valospectra.com";
    }
    this.electron.processAuxInputs(ingestIp, this.playername);
  }

  protected toggleDarkMode() {
    const element = document.querySelector("html");
    element!.classList.toggle("dark");
    this.darkModeEnabled = !this.darkModeEnabled;
    this.localStorageService.setItem("darkMode", this.darkModeEnabled);
  }

  protected toggleTraySetting(event: ToggleSwitchChangeEvent) {
    this.localStorageService.setItem("auxMinimizedToTraySetting", event.checked);
    this.electron.setTraySetting(event.checked);
  }
}
