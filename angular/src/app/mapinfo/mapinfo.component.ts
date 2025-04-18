import { TitleCasePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
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
export class MapinfoComponent {
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
    "Breach",
    "Haven",
    "Split",
    "Ascent",
    "Icebox",
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
}
