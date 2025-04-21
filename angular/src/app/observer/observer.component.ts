import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { SelectModule } from "primeng/select";
import { RadioButtonModule } from "primeng/radiobutton";
import { ButtonModule } from "primeng/button";
import { ElectronService, Status, StatusTypes } from "../services/electron.service";
import { TagModule } from "primeng/tag";
import { InputNumberModule } from "primeng/inputnumber";
import { TeaminfoComponent } from "../teaminfo/teaminfo.component";
import { SeriesinfoComponent } from "../seriesinfo/seriesinfo.component";
import { TournamentinfoComponent } from "../tournamentinfo/tournamentinfo.component";
import { MapinfoComponent } from "../mapinfo/mapinfo.component";
import { HotkeysComponent } from "../hotkeys/hotkeys.component";
import { LocalstorageService } from "../services/localstorage.service";
import { ObserverinfoComponent, ingestServerOptions } from "./observerinfo/observerinfo.component";
import { SplitButtonModule } from "primeng/splitbutton";
import { PopoverModule } from "primeng/popover";
import { TitleCasePipe } from "@angular/common";
import { RadiobuttonService } from "../services/radiobutton.service";
import { BlockUIModule } from "primeng/blockui";
import { BlockableDiv } from "../blockablediv/blockablediv.component";

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
    PopoverModule,
    TitleCasePipe,
    BlockUIModule,
    BlockableDiv,
  ],
  templateUrl: "./observer.component.html",
  styleUrl: "./observer.component.css",
})
export class ObserverComponent implements OnInit {
  protected spectraStatus: Status = { message: "Initializing", statusType: StatusTypes.NEUTRAL };
  protected gameStatus: Status = { message: "Waiting", statusType: StatusTypes.NEUTRAL };
  protected darkModeEnabled: boolean = false;
  protected editable: boolean = true;

  protected ingestServerOptions: string[] = ingestServerOptions;
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
    protected changeDetectorRef: ChangeDetectorRef,
    protected radiobuttonService: RadiobuttonService,
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

  ngOnInit() {
    this.electron.spectraStatusMessage.subscribe((status: Status) => {
      this.spectraStatus = status;
      this.changeDetectorRef.detectChanges();
    });

    this.electron.gameStatusMessage.subscribe((status: Status) => {
      this.gameStatus = status;
      this.changeDetectorRef.detectChanges();
    });

    this.electron.inputAllowedMessage.subscribe((value: boolean) => {
      this.editable = value;
      this.changeDetectorRef.detectChanges();
    });
  }

  protected onConnectClick() {
    this.electron.processInputs(
      this.basicInfo.ingestIp,
      this.basicInfo.groupCode,
      this.basicInfo.name,
      //left team info
      {
        ...this.leftTeamInfo,
        attackStart: this.radiobuttonService.attackStart == "left",
      },
      //right team info
      {
        ...this.rightTeamInfo,
        attackStart: this.radiobuttonService.attackStart == "right",
      },
      this.basicInfo.key,
      //series info
      {
        ...this.seriesInfo,
        mapInfo: this.tournamentInfo.showMappool
          ? [this.leftMap, this.centerMap, this.rightMap]
          : [],
      },
      //seeding info
      {
        left: this.seriesInfo.seedingLeft,
        right: this.seriesInfo.seedingRight,
      },
      this.tournamentInfo,
      this.hotkeys,
      this.tournamentInfo.timeoutDuration,
    );

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

  copyToClipboardClick() {
    const link = `https://${this.basicInfo.ingestIp}/overlay?groupCode=${this.basicInfo.groupCode}`;
    navigator.clipboard.writeText(link);
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
