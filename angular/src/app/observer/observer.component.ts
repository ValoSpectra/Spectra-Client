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
import { LocalstorageService } from "../services/localstorage.service";
import { ObserverinfoComponent } from "./observerinfo/observerinfo.component";
import { SplitButtonModule } from "primeng/splitbutton";

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
    ObserverinfoComponent,
    SplitButtonModule,
  ],
  templateUrl: "./observer.component.html",
  styleUrl: "./observer.component.css",
})
export class ObserverComponent {
  protected darkModeEnabled: boolean = false;

  protected basicInfo: BasicInfo = {
    name: "",
    key: "",
    groupCode: "",
    ingestIp: undefined,
  };

  protected leftTeamInfo: TeamInfo = {
    name: "",
    tricode: "",
    logoUrl: "",
  };

  protected rightTeamInfo: TeamInfo = {
    name: "",
    tricode: "",
    logoUrl: "",
  };

  protected tournamentInfo: TournamentInfo = {
    name: false,
    logoUrl: "",
    backdropUrl: "",
    timeoutDuration: 60,
    showMappool: false,
  };

  protected seriesInfo: SeriesInfo = {
    enable: false,
    needed: null,
    wonLeft: null,
    wonRight: null,
    seedingLeft: "",
    seedingRight: "",
  };

  protected leftMap: MapInfo = {
    type: "Past",
    map: undefined,
    leftScore: null,
    rightScore: null,
  };

  protected centerMap: MapInfo = {
    type: "Present",
    picker: "right",
  };

  protected rightMap: MapInfo = {
    type: "Future",
    map: undefined,
    picker: "decider",
  };

  protected hotkeys: Hotkeys = {
    spikePlanted: "F9",
    techPause: "F10",
    leftTimeout: "O",
    rightTimeout: "P",
  };

  constructor(
    protected electron: ElectronService,
    protected localStorageService: LocalstorageService,
  ) {
    const loadedDarkModeEnabled = this.localStorageService.getItem<boolean>("darkMode");
    if (loadedDarkModeEnabled !== null) {
      this.darkModeEnabled = loadedDarkModeEnabled;
    } else {
      this.darkModeEnabled = true;
    }
    if (this.darkModeEnabled) {
      const element = document.querySelector("html");
      element!.classList.add("dark");
    }

    this.basicInfo = this.localStorageService.getItem<BasicInfo>("basicInfo") || this.basicInfo;

    this.leftTeamInfo =
      this.localStorageService.getItem<TeamInfo>("leftTeamInfo") || this.leftTeamInfo;

    this.rightTeamInfo =
      this.localStorageService.getItem<TeamInfo>("rightTeamInfo") || this.rightTeamInfo;

    this.tournamentInfo =
      this.localStorageService.getItem<TournamentInfo>("tournamentInfo") || this.tournamentInfo;

    const newSeriesInfo = this.localStorageService.getItem<SeriesInfo>("seriesInfo");
    if (newSeriesInfo && newSeriesInfo.enable) {
      this.seriesInfo = newSeriesInfo;
    }

    this.leftMap = this.localStorageService.getItem<MapInfo>("leftMap") || this.leftMap;
    this.centerMap = this.localStorageService.getItem<MapInfo>("centerMap") || this.centerMap;
    this.rightMap = this.localStorageService.getItem<MapInfo>("rightMap") || this.rightMap;
    this.hotkeys = this.localStorageService.getItem<Hotkeys>("hotkeys") || this.hotkeys;
  }

  protected onConnectClick() {
    // const seriesInfo = {
    //   needed: 1,
    //   wonLeft: 0,
    //   wonRight: 0,
    //   mapInfo: [],
    // };
    // const seedingInfo = {
    //   left: "",
    //   right: "",
    // };
    // const emptyTournamentInfo = {
    //   name: "",
    //   logoUrl: "",
    //   backdropUrl: "",
    // };
    // const hotkeys = {
    //   spikePlanted: "F9",
    //   techPause: "F10",
    //   leftTimeout: "O",
    //   rightTimeout: "P",
    // };
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

    this.localStorageService.setItem("basicInfo", this.basicInfo);
    this.localStorageService.setItem("leftTeamInfo", this.leftTeamInfo);
    this.localStorageService.setItem("rightTeamInfo", this.rightTeamInfo);
    this.localStorageService.setItem("tournamentInfo", this.tournamentInfo);
    this.localStorageService.setItem("seriesInfo", this.seriesInfo);
    this.localStorageService.setItem("leftMap", this.leftMap);
    this.localStorageService.setItem("centerMap", this.centerMap);
    this.localStorageService.setItem("rightMap", this.rightMap);
    this.localStorageService.setItem("hotkeys", this.hotkeys);
  }

  onOpenExternalClick() {
    console.log("Open external link clicked");
  }

  protected toggleDarkMode() {
    const element = document.querySelector("html");
    element!.classList.toggle("dark");
    this.darkModeEnabled = !this.darkModeEnabled;
    this.localStorageService.setItem("darkMode", this.darkModeEnabled);
  }
}

export type BasicInfo = {
  name: string;
  key: string;
  groupCode: string;
  ingestIp: string | undefined;
};

export type TeamInfo = {
  name: string;
  tricode: string;
  logoUrl: string;
};

export type TournamentInfo = {
  // name just activates the round win box at this time
  name: boolean;
  logoUrl: string;
  backdropUrl: string;
  timeoutDuration: number;
  showMappool: boolean;
};

export type SeriesInfo = {
  enable: boolean;
  needed: number | null;
  wonLeft: number | null;
  wonRight: number | null;
  seedingLeft: string;
  seedingRight: string;
};

export type Hotkeys = {
  spikePlanted: string;
  techPause: string;
  leftTimeout: string;
  rightTimeout: string;
};

type BaseMapInfo = {
  type: "Past" | "Present" | "Future";
};

type PastMapInfo = BaseMapInfo & {
  type: "Past";
  map: string | undefined;
  leftScore: number | null;
  rightScore: number | null;
};

type PresentMapInfo = BaseMapInfo & {
  type: "Present";
  picker: "left" | "right";
};

type FutureMapInfo = BaseMapInfo & {
  type: "Future";
  map: string | undefined;
  picker: "left" | "right" | "decider";
};

export type MapInfo = PastMapInfo | PresentMapInfo | FutureMapInfo;
