import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUIModule } from "primeng/blockui";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TournamentInfo } from "../observer/observer.component";
import { Validatable, ValidationState } from "../services/validation.service";
import { PopoverModule } from "primeng/popover";

@Component({
  selector: "app-tournamentinfo",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ToggleSwitchModule,
    InputNumberModule,
    BlockUIModule,
    PopoverModule,
  ],
  templateUrl: "./tournamentinfo.component.html",
  styleUrl: "./tournamentinfo.component.css",
})
export class TournamentinfoComponent implements Validatable, AfterContentInit {
  @Input({ required: true })
  data!: TournamentInfo;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;

    valid = this.logoImageError == false && valid;
    valid = this.backdropImageError == false && valid;
    valid = this.data.timeoutDuration != null && valid;

    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }

  protected logoImageError: boolean = false;

  protected onLogoImageLoadError() {
    if (this.data.logoUrl == "") {
      this.logoImageError = false;
      return;
    }
    this.logoImageError = true;
    this.runValidation();
  }

  protected onLogoImageLoadSuccess() {
    this.logoImageError = false;
    this.runValidation();
  }

  protected backdropImageError: boolean = false;

  protected onBackdropImageLoadError() {
    if (this.data.backdropUrl == "") {
      this.backdropImageError = false;
      return;
    }
    this.backdropImageError = true;
    this.runValidation();
  }

  protected onBackdropImageLoadSuccess() {
    this.backdropImageError = false;
    this.runValidation();
  }
}
