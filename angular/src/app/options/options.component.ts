import { Component, OnInit } from "@angular/core";
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
	// Visual-only state (no functionality yet)
	minimizeToTray: boolean = false; 
	runAtStartup: boolean = false;
	startMinimized: boolean = false; // Only used if runAtStartup is true

	private readonly storageKey = "appOptions";

		constructor(private storage: LocalstorageService, private electron: ElectronService) {}

	ngOnInit(): void {
		const saved = this.storage.getItem<{ minimizeToTray: boolean; runAtStartup: boolean; startMinimized?: boolean }>(
			this.storageKey,
		);
		if (saved) {
			this.minimizeToTray = saved.minimizeToTray ?? this.minimizeToTray;
			this.runAtStartup = saved.runAtStartup ?? this.runAtStartup;
			this.startMinimized = saved.startMinimized ?? this.startMinimized;
		} else {
			// Seed defaults
			this.save();
		}
		// Apply tray setting to Electron main
		this.electron.setTraySetting(this.minimizeToTray);
		// Push startup settings to main (in case they were restored)
		this.electron.setStartupSettings(this.runAtStartup, this.runAtStartup && this.startMinimized);
	}

	save() {
			// If runAtStartup turned off, also clear startMinimized
			if (!this.runAtStartup && this.startMinimized) {
				this.startMinimized = false;
			}
			this.storage.setItem(this.storageKey, {
				minimizeToTray: this.minimizeToTray,
				runAtStartup: this.runAtStartup,
					startMinimized: this.startMinimized,
			});
		// Forward tray setting to Electron main
		this.electron.setTraySetting(this.minimizeToTray);
			// Update startup settings in main (start minimized disabled)
				this.electron.setStartupSettings(this.runAtStartup, this.runAtStartup && this.startMinimized);
	}
}

