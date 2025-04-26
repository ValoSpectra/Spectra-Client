import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { Hotkeys } from "../observer/observer.component";
import { FormsModule } from "@angular/forms";
import { Validatable, ValidationState } from "../services/validation.service";

@Component({
  selector: "app-hotkeys",
  imports: [FormsModule, InputTextModule, FloatLabel],
  templateUrl: "./hotkeys.component.html",
  styleUrl: "./hotkeys.component.css",
})
export class HotkeysComponent implements Validatable, AfterContentInit {
  @Input({ required: true })
  data!: Hotkeys;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    valid = this.data.leftTimeout != "" && valid;
    valid = this.data.rightTimeout != "" && valid;
    valid = this.data.spikePlanted != "" && valid;
    valid = this.data.techPause != "" && valid;
    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }
}
