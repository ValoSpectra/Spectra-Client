import { TitleCasePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RadioButtonModule } from "primeng/radiobutton";
import { SelectModule } from "primeng/select";

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
  ],
  templateUrl: "./mapinfo.component.html",
  styleUrl: "./mapinfo.component.css",
})
export class MapinfoComponent {
  mapTimeOptions: string[] = ["Past", "Present", "Future"];
  selectedMapTime: string = "Past";

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

  selectedMap: string | undefined = undefined;

  @Input()
  position: "left" | "center" | "right" = "left";

  protected picker!: number;
}
