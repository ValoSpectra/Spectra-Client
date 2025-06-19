import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BlockUI } from "primeng/blockui";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { FormsModule, NgModel } from "@angular/forms";
import { WatermarkInfo } from "../observer/observer.component";
import { ValidationState } from "../services/validation.service";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PopoverModule } from "primeng/popover";

@Component({
  selector: "app-watermark",
  imports: [
    ToggleSwitchModule,
    BlockUI,
    BlockableDiv,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    PopoverModule,
  ],
  templateUrl: "./watermark.component.html",
  styleUrl: "./watermark.component.css",
})
export class WatermarkComponent {
  @Input({ required: true })
  data!: WatermarkInfo;

  @Input({ required: false })
  isSupporter: boolean = false;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    if (this.data.spectraWatermark) {
      this.data.customTextEnabled = false;
    }

    if (this.data.customTextEnabled) {
      if (!this.data.customText || this.data.customText == "") {
        this.validationChanged.emit(ValidationState.INVALID);
        return;
      }
    }

    this.validationChanged.emit(ValidationState.VALID);
  }
}
