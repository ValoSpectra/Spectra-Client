import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUIModule } from "primeng/blockui";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { SeriesInfo } from "../observer/observer.component";
import { Validatable, ValidationState } from "../services/validation.service";

@Component({
  selector: "app-seriesinfo",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    InputNumberModule,
    ToggleSwitchModule,
    BlockUIModule,
    BlockableDiv,
  ],
  templateUrl: "./seriesinfo.component.html",
  styleUrl: "./seriesinfo.component.css",
})
export class SeriesinfoComponent implements Validatable, AfterContentInit {
  @Input()
  data!: SeriesInfo;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    if (!this.data.enable) {
      this.validationChanged.emit(ValidationState.OPTIONAL);
      return;
    }

    valid = this.data.needed != null && valid;
    valid = this.data.wonLeft != null && valid;
    valid = this.data.wonRight != null && valid;

    const seedingValid: boolean =
      (this.data.seedingLeft != "" && this.data.seedingRight != "") ||
      (this.data.seedingLeft == "" && this.data.seedingRight == "");

    valid = seedingValid && valid;

    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }
}
