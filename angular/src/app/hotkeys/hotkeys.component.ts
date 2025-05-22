import {
  AfterContentInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { Hotkeys } from "../observer/observer.component";
import { FormsModule } from "@angular/forms";
import { Validatable, ValidationState } from "../services/validation.service";
import { ButtonModule } from "primeng/button";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { Popover, PopoverModule } from "primeng/popover";
import { CheckboxModule } from "primeng/checkbox";
import { ToggleButtonModule } from "primeng/togglebutton";
import { ToggleSwitchModule } from "primeng/toggleswitch";

@Component({
  selector: "app-hotkeys",
  imports: [
    FormsModule,
    InputTextModule,
    FloatLabel,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    PopoverModule,
    ToggleButtonModule,
    CheckboxModule,
    ToggleSwitchModule
  ],
  templateUrl: "./hotkeys.component.html",
  styleUrl: "./hotkeys.component.css",
})
export class HotkeysComponent implements Validatable, AfterContentInit {
  @Input({ required: true })
  data!: Hotkeys;

  valid = { spikePlanted: false, techPause: false, leftTimeout: false, rightTimeout: false };

  @ViewChild("change_popover")
  changePopover!: Popover;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  protected isCapturing = false;
  protected capturingHotkey: "timeLeft" | "timeRight" | "techPause" | "spike" | "" = "";

  @HostListener("window:keyup", ["$event"])
  onKeyUp(event: KeyboardEvent) {
    
    if (event.key == "Shift" || event.key == "Control" || event.key == "Alt") {
      this.onKeyDown(event);
      return;
    }
    
    this.stopCapturing();
  }

  stopCapturing() {
    this.isCapturing = false;
    this.capturingHotkey = "";
    this.changePopover.hide();
    this.runValidation();
  }

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isCapturing) return;
    if (event.key == "Escape") {
      this.stopCapturing(); 
      return;
    }
    let keyString = "";
    if (event.ctrlKey) keyString += "Ctrl+";
    if (event.altKey) keyString += "Alt+";
    if (event.shiftKey) keyString += "Shift+";

    //filter out the modifier keys themselves
    if (event.key != "Shift" && event.key != "Alt" && event.key != "Control") {
      keyString += event.key;
    }
    event.stopPropagation();

    switch (this.capturingHotkey) {
      case "timeLeft":
        this.data.leftTimeout = keyString;
        break;
      case "timeRight":
        this.data.rightTimeout = keyString;
        break;
      case "techPause":
        this.data.techPause = keyString;
        break;
      case "spike":
        this.data.spikePlanted = keyString;
        break;
    }
  }

  changeKeybind(event: any, hotkey: "timeLeft" | "timeRight" | "techPause" | "spike") {
    this.isCapturing = true;
    this.capturingHotkey = hotkey;
    this.changePopover.show(event);
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    const hotkeyRegex = /^(Ctrl\+|Alt\+|Shift\+)*(\D|F[1-9][0-1]?|\d)$/g;

    this.valid.spikePlanted = !this.data.enabled.spikePlanted || this.data.spikePlanted.match(hotkeyRegex) != null;
    this.valid.techPause = !this.data.enabled.techPause || this.data.techPause.match(hotkeyRegex) != null;
    this.valid.leftTimeout = !this.data.enabled.leftTimeout || this.data.leftTimeout.match(hotkeyRegex) != null;
    this.valid.rightTimeout = !this.data.enabled.rightTimeout || this.data.rightTimeout.match(hotkeyRegex) != null;

    valid =
      this.valid.spikePlanted &&
      this.valid.techPause &&
      this.valid.leftTimeout &&
      this.valid.rightTimeout;
    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }
}
