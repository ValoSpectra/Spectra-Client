import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { Validatable, ValidationState } from "../services/validation.service";
import { ButtonModule } from "primeng/button";
import { InputNumberModule } from "primeng/inputnumber";
import { SponsorInfo } from "../observer/observer.component";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { BlockUIModule } from "primeng/blockui";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { PopoverModule } from "primeng/popover";

@Component({
  selector: "app-sponsor",
  imports: [
    FloatLabelModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    ToggleSwitchModule,
    BlockUIModule,
    BlockableDiv,
    PopoverModule,
  ],
  templateUrl: "./sponsor.component.html",
  styleUrl: "./sponsor.component.css",
})
export class SponsorComponent implements Validatable, AfterContentInit {
  @Input({ required: true })
  data!: SponsorInfo;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    if (!this.data.enabled) {
      this.validationChanged.emit(ValidationState.OPTIONAL);
      return;
    }

    // Make sure fields that get emptied are removed
    for (let i = 0; i < this.data.sponsors.length; i++) {
      const sponsor = this.data.sponsors[i];
      if (sponsor.trim() === "") {
        console.log(`Sponsor at index ${i} is empty, removing it.`);
        this.data.sponsors.splice(i, 1);
        this.sponsorImageError.splice(i, 1);
        i--; // Adjust index after removal
      }
    }

    valid = this.data.duration >= 3000 && this.data.duration <= 30000;
    valid = valid && !this.sponsorImageError.includes(true);
    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }

  protected sponsorImageError: boolean[] = [];

  protected onSponsorImageLoadError(index: number) {
    if (this.data.sponsors[index] == "" || this.data.sponsors[index] == null) {
      this.runValidation();
      return;
    }
    this.sponsorImageError[index] = true;
    this.runValidation();
  }

  protected onSponsorImageLoadSuccess(index: number) {
    this.sponsorImageError[index] = false;
    this.runValidation();
  }

  numSequence(n: number): number[] {
    return Array(n);
  }

  moveUp(index: number) {
    if (index > 0) {
      const temp = this.data.sponsors[index - 1];
      this.data.sponsors[index - 1] = this.data.sponsors[index];
      this.data.sponsors[index] = temp;
    }
  }

  moveDown(index: number) {
    if (index < this.data.sponsors.length - 1) {
      const temp = this.data.sponsors[index + 1];
      this.data.sponsors[index + 1] = this.data.sponsors[index];
      this.data.sponsors[index] = temp;
    }
  }
}
