import { TitleCasePipe } from "@angular/common";
import { AfterContentInit, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUIModule } from "primeng/blockui";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RadioButtonModule } from "primeng/radiobutton";
import { SelectModule } from "primeng/select";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { MapInfo } from "../observer/observer.component";
import { Validatable, ValidationState } from "../services/validation.service";

@Component({
  selector: "app-mapinfo",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    TitleCasePipe,
    PanelModule,
    BlockUIModule,
    BlockableDiv,
  ],
  templateUrl: "./mapinfo.component.html",
  styleUrl: "./mapinfo.component.css",
})
export class MapinfoComponent implements Validatable, AfterContentInit, OnChanges {
  protected mapTimeOptions_left: string[] = ["Past", "Present"];
  protected mapTimeOptions_center: string[] = ["Past", "Present", "Future"];
  protected mapTimeOptions_right: string[] = ["Present", "Future"];

  protected getMapTimeOptions(): string[] {
    switch (this.position) {
      case "left":
        return this.mapTimeOptions_left;
      case "center":
        return this.mapTimeOptions_center;
      case "right":
        return this.mapTimeOptions_right;
    }
  }

  mapSuggestions: string[] = [
    "Bind",
    "Haven",
    "Split",
    "Ascent",
    "Icebox",
    "Breeze",
    "Fracture",
    "Pearl",
    "Lotus",
    "Sunset",
    "Abyss",
  ];

  @Input({ required: true })
  data!: MapInfo;

  @Input()
  position: "left" | "center" | "right" = "left";

  @Input()
  blocked: boolean = false;

  ngOnChanges(): void {
    this.runValidation();
  }

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;

    if (this.blocked) {
      this.validationChanged.emit(ValidationState.OPTIONAL);
      return;
    }

    switch (this.data.type) {
      case "Past":
        valid = this.data.map != null;
        valid = valid && this.data.leftScore != null && this.data.rightScore != null;
        break;
      case "Present":
        valid = ["left", "right"].includes(this.data.picker);
        break;

      case "Future":
        valid = this.data.map != null;
        valid = valid && ["left", "right", "decider"].includes(this.data.picker);
        break;

      default:
        valid = false;
    }

    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }
}
