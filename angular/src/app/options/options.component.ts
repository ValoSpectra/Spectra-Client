import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUI } from "primeng/blockui";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { LocalstorageService } from "../services/localstorage.service";
import { ElectronService } from "../services/electron.service";

@Component({
  selector: "app-options",
  imports: [ToggleSwitchModule, BlockUI, BlockableDiv, FormsModule],
  templateUrl: "./options.component.html",
  styleUrl: "./options.component.css",
})
export class OptionsComponent implements OnInit {
  data: ClientOptions = {
    minimizeToTray: false,
    runAtStartup: false,
    startMinimized: false,
    aux: false,
  };

  private readonly storageKey = "appOptions";

  @Input({required: false})
  isAux = false;

  constructor(
    private storage: LocalstorageService,
    private electron: ElectronService,
  ) {}

  ngOnInit(): void {
    const saved = this.storage.getItem<ClientOptions>(this.storageKey);
    if (saved) {
      this.data.minimizeToTray = saved.minimizeToTray ?? this.data.minimizeToTray;
      this.data.runAtStartup = saved.runAtStartup ?? this.data.runAtStartup;
      this.data.startMinimized = saved.startMinimized ?? this.data.startMinimized;
    } else {
      // Seed defaults
      this.save();
    }
    // Apply tray setting to Electron main
    this.electron.setTraySetting(this.data.minimizeToTray);
    // Push startup settings to main (in case they were restored)
    this.electron.setStartupSettings(
      this.data.runAtStartup,
      this.data.runAtStartup && this.data.startMinimized,
      this.data.runAtStartup && this.isAux
    );
  }

  save() {
    // If runAtStartup turned off, also clear startMinimized
    if (!this.data.runAtStartup && this.data.startMinimized) {
      this.data.startMinimized = false;
    }
    this.storage.setItem(this.storageKey, this.data);
    // Forward tray setting to Electron main
    this.electron.setTraySetting(this.data.minimizeToTray);
    // Update startup settings in main (start minimized disabled)
    this.electron.setStartupSettings(
      this.data.runAtStartup,
      this.data.runAtStartup && this.data.startMinimized,
      this.data.runAtStartup && this.isAux
    );
  }
}

export type ClientOptions = {
  minimizeToTray: boolean;
  runAtStartup: boolean;
  startMinimized: boolean;
  aux: boolean;
};
