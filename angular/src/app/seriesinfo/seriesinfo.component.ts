import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockUIModule } from "primeng/blockui";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { SeriesInfo } from "../observer/observer.component";

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
export class SeriesinfoComponent {
  @Input()
  data!: SeriesInfo;
}
