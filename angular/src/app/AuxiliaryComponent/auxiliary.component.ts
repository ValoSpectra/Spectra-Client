import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { ElectronService } from "../services/electron.service";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-auxiliary",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    SelectModule,
    ToggleSwitchModule,
    TagModule,
  ],
  templateUrl: "./auxiliary.component.html",
  styleUrl: "./auxiliary.component.css",
})
export class AuxiliaryComponent {
  constructor(protected electron: ElectronService) {}

  protected ingestServerOptions: string[] = ["eu.valospectra.com", "na.valospectra.com"];
  protected ingestServerIp: string | undefined = undefined;

  // this.electron.processInputs(
  //   this.ingestServerIp,
  //   this.groupCode,
  //   "Tiranthine",
  //   {
  //     ...this.leftTeamInfo,
  //     attackStart: false,
  //   },
  //   {
  //     ...this.rightTeamInfo,
  //     attackStart: true,
  //   },
  //   this.key,
  //   seriesInfo,
  //   seedingInfo,
  //   emptyTournamentInfo,
  //   hotkeys,
  //   60,
  // );
  // }
}
