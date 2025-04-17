import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { SelectModule } from "primeng/select";
import { RadioButtonModule } from "primeng/radiobutton";
import { ButtonModule } from "primeng/button";
import { ElectronService } from "../services/electron.service";
import { TagModule } from "primeng/tag";
import { InputNumberModule } from "primeng/inputnumber";
import { TeaminfoComponent } from "../teaminfo/teaminfo.component";
import { SeriesinfoComponent } from "../seriesinfo/seriesinfo.component";
import { TournamentinfoComponent } from "../tournamentinfo/tournamentinfo.component";
import { MapinfoComponent } from "../mapinfo/mapinfo.component";
import { HotkeysComponent } from "../hotkeys/hotkeys.component";

@Component({
  selector: "app-observer",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    PasswordModule,
    SelectModule,
    RadioButtonModule,
    ButtonModule,
    TagModule,
    InputNumberModule,
    TeaminfoComponent,
    SeriesinfoComponent,
    TournamentinfoComponent,
    MapinfoComponent,
    HotkeysComponent,
  ],
  templateUrl: "./observer.component.html",
  styleUrl: "./observer.component.css",
})
export class ObserverComponent {
  constructor(protected electron: ElectronService) {}

  protected ingestServerOptions: string[] = ["eu.valospectra.com", "na.valospectra.com"];

  protected key: string = "";
  protected groupCode: string = "DEBUG";
  protected ingestServerIp: string | undefined = undefined;
  protected leftTeamInfo: any = {
    name: "Wachunpelo Pelupelu Gamers",
    tricode: "PELU",
    url: "https://dnkl.gg/QL3ls",
  };
  protected rightTeamInfo: any = {
    name: "Ok'hanu Ohokaliy Enjoyers",
    tricode: "HANU",
    url: "https://dnkl.gg/PEAsu",
  };

  protected onConnectClick() {
    const seriesInfo = {
      needed: 1,
      wonLeft: 0,
      wonRight: 0,
      mapInfo: [],
    };

    const seedingInfo = {
      left: "",
      right: "",
    };

    const emptyTournamentInfo = {
      name: "",
      logoUrl: "",
      backdropUrl: "",
    };

    const hotkeys = {
      spikePlanted: "F9",
      techPause: "F10",
      leftTimeout: "O",
      rightTimeout: "P",
    };

    this.electron.processInputs(
      this.ingestServerIp,
      this.groupCode,
      "Tiranthine",
      {
        ...this.leftTeamInfo,
        attackStart: false,
      },
      {
        ...this.rightTeamInfo,
        attackStart: true,
      },
      this.key,
      seriesInfo,
      seedingInfo,
      emptyTournamentInfo,
      hotkeys,
      60,
    );
  }
}
