import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { ImageModule } from "primeng/image";
import { InputTextModule } from "primeng/inputtext";
import { PopoverModule } from "primeng/popover";
import { TeamInfo } from "../observer/observer.component";
import { TitleCasePipe } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { RadioButtonModule } from "primeng/radiobutton";
import { RadiobuttonService } from "../services/radiobutton.service";
import { Validatable, ValidationState } from "../services/validation.service";

@Component({
  selector: "app-teaminfo",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ImageModule,
    PopoverModule,
    TitleCasePipe,
    CheckboxModule,
    RadioButtonModule,
  ],
  templateUrl: "./teaminfo.component.html",
  styleUrl: "./teaminfo.component.css",
})
export class TeaminfoComponent implements Validatable, AfterContentInit {
  @Input()
  teaminfo!: TeamInfo;

  @Input()
  position: "left" | "right" = "left";

  constructor(protected radiobuttonService: RadiobuttonService) {}

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;

    valid = this.teaminfo.name != "" && valid;
    valid = this.teaminfo.tricode != "" && valid;

    valid = this.teaminfo.url != "" && valid;
    valid = !this.logoImageError && valid;

    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }

  protected logoImageError: boolean = false;

  protected onImageLoadError() {
    this.logoImageError = true;
    this.runValidation();
  }

  protected onImageLoadSuccess() {
    this.logoImageError = false;
    this.runValidation();
  }
}
