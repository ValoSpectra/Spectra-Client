import { AfterContentInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUIModule } from "primeng/blockui";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { RoundWinBox } from "../observer/observer.component";
import { Validatable, ValidationState } from "../services/validation.service";
import { PopoverModule } from "primeng/popover";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { Button } from "primeng/button";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { Select } from "primeng/select";
import { MultiSelectModule } from "primeng/multiselect";

@Component({
  selector: "app-roundwinbox",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ToggleSwitchModule,
    InputNumberModule,
    BlockUIModule,
    PopoverModule,
    BlockableDiv,
    Button,
    InputGroup,
    InputGroupAddon,
    Select,
    MultiSelectModule,
  ],
  templateUrl: "./roundwinbox.component.html",
  styleUrl: "./roundwinbox.component.css",
})
export class RoundwinboxComponent implements Validatable, AfterContentInit {
  @Input({ required: true })
  data!: RoundWinBox;

  @Input({ required: false })
  isSupporter: boolean = false;

  roundWinBoxTeams = ["all", "left", "right"];
  roundWinBoxRoundCeremonie = ["all", "normal", "ace", "clutch", "teamAce", "flawless", "thrifty"];

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    if (this.data.type !== "sponsors") {
      this.validationChanged.emit(ValidationState.OPTIONAL);
      return;
    }

    this.sponsorTypeError = [];

    for (let i = 0; i < this.data.sponsors.length; i++) {
      const sponsor = this.data.sponsors[i];
      for (let j = 0; j < this.data.sponsors.length; j++) {
        if (i != j) {
          const spons = this.data.sponsors[j];
          if (
            sponsor.wonTeam == spons.wonTeam ||
            sponsor.wonTeam == "all" ||
            spons.wonTeam == "all"
          ) {
            for (const ceremonie of sponsor.roundCeremonie) {
              if (
                spons.roundCeremonie.includes(ceremonie) ||
                (ceremonie == "all" && spons.roundCeremonie.length > 0)
              ) {
                this.sponsorTypeError[i] = true;
                this.sponsorTypeError[j] = true;
              }
            }
          }
        }
      }
    }

    valid =
      valid &&
      !this.sponsorIconError.includes(true) &&
      !this.sponsorBackdropError.includes(true) &&
      !this.sponsorTypeError.includes(true);

    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }

  protected sponsorIconError: boolean[] = [];
  protected sponsorBackdropError: boolean[] = [];

  protected sponsorTypeError: boolean[] = [];

  protected updateSponsor(
    index: number,
    field: "iconUrl" | "backdropUrl" | "wonTeam" | "roundCeremonie",
    value: string,
  ) {
    if (!this.data.sponsors[index]) {
      this.data.sponsors[index] = {
        wonTeam: "all",
        roundCeremonie: ["all"],
        iconUrl: "",
        backdropUrl: "",
      };
    }

    this.data.sponsors[index][field] = value as any;

    this.runValidation();
  }

  protected onSponsorImageLoadError(index: number, type: "icon" | "backdrop") {
    if (type == "icon") {
      if (this.data.sponsors[index].iconUrl == "" || this.data.sponsors[index] == null) {
        this.sponsorIconError[index] = false;
        this.runValidation();
        return;
      } else {
        this.sponsorIconError[index] = true;
      }
    }

    if (type == "backdrop") {
      if (this.data.sponsors[index].backdropUrl == "" || this.data.sponsors[index] == null) {
        this.sponsorBackdropError[index] = false;
        this.runValidation();
        return;
      } else {
        this.sponsorBackdropError[index] = true;
      }
    }
    this.runValidation();
  }

  protected onSponsorImageLoadSuccess(index: number, type: "icon" | "backdrop") {
    if (type == "icon") this.sponsorIconError[index] = false;
    if (type == "backdrop") this.sponsorBackdropError[index] = false;

    this.runValidation();
  }

  numSequence(n: number): number[] {
    return Array(n);
  }
}
