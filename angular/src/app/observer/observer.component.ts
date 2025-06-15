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
import { DrawerModule } from "primeng/drawer";
import { PanelMenuModule } from "primeng/panelmenu";
import { MenuItem, MenuItemCommandEvent } from "primeng/api";
import { ValidationState } from "../services/validation.service";
import { DialogModule } from "primeng/dialog";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TooltipModule } from "primeng/tooltip";
import { SponsorComponent } from "../sponsor/sponsor.component";
import { HttpClient } from "@angular/common/http";

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
    DrawerModule,
    PanelMenuModule,
    DialogModule,
    ToggleSwitchModule,
    TooltipModule,
    SponsorComponent,
  ],
  templateUrl: "./observer.component.html",
  styleUrl: "./observer.component.css",
})
export class ObserverComponent implements OnInit {
  protected spectraStatus: Status = { message: "Initializing", statusType: StatusTypes.NEUTRAL };
  protected gameStatus: Status = { message: "Waiting", statusType: StatusTypes.NEUTRAL };
  protected darkModeEnabled: boolean = false;
  protected editable: boolean = true;
  protected tryingToConnect: boolean = false;

  protected drawerVisible: boolean = false;
  protected checklistItems: MenuItem[] = [
    {
      label: "General Info",
      fragment: "observerinfoPanelId",
      command: this.scrollToPanel.bind(this),
    },
    {
      label: "Team Info",
      disabled: true,
      expanded: true,
      items: [
        {
          label: "Left Team",
          fragment: "leftTeaminfoPanelId",
          command: this.scrollToPanel.bind(this),
        },
        {
          label: "Right Team",
          fragment: "rightTeaminfoPanelId",
          command: this.scrollToPanel.bind(this),
        },
      ],
    },
    {
      label: "Tournament Info",
      fragment: "tournamentinfoPanelId",
      command: this.scrollToPanel.bind(this),
    },
    {
      label: "Series Info",
      fragment: "seriesinfoPanelId",
      command: this.scrollToPanel.bind(this),
    },
    {
      label: "Hotkey Settings",
      fragment: "hotkeySettingsId",
      command: this.scrollToPanel.bind(this),
    },
    {
      label: "Mappool Info",
      disabled: true,
      expanded: true,
      items: [
        {
          label: "Left Map",
          fragment: "leftMapPanelId",
          command: this.scrollToPanel.bind(this),
        },
        {
          label: "Center Map",
          fragment: "centerMapPanelId",
          command: this.scrollToPanel.bind(this),
        },
        {
          label: "Right Map",
          fragment: "rightMapPanelId",
          command: this.scrollToPanel.bind(this),
        },
      ],
    },
    {
      label: "Sponsors",
      fragment: "sponsorPanelId",
      command: this.scrollToPanel.bind(this),
    },
  ];

  protected issueDialogVisible: boolean = false;
  validationIssuesDetected: boolean = false;
  protected issueStore: Map<string, ValidationState> = new Map<string, ValidationState>();

  protected extrasDialogVisible: boolean = false;
  protected extrasIssueMessage: string = "";

  //#region Data strucures definition
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
    url: "",
  };

  protected rightTeamInfo: TeamInfo = {
    name: "",
    tricode: "",
    url: "",
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
    enabled: {
      spikePlanted: false,
      techPause: true,
      leftTimeout: true,
      rightTimeout: true,
    },
  };

  protected sponsorInfo: SponsorInfo = {
    enabled: false,
    duration: 5000,
    sponsors: [],
  };
  //#endregion

  constructor(
    protected electron: ElectronService,
    protected localStorageService: LocalstorageService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected radiobuttonService: RadiobuttonService,
    protected http: HttpClient,
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
    if (!this.hotkeys.enabled) {
      this.hotkeys.enabled = {
        spikePlanted: false,
        techPause: true,
        leftTimeout: true,
        rightTimeout: true,
      };
    }

    this.sponsorInfo =
      this.localStorageService.getItem<SponsorInfo>("sponsors") || this.sponsorInfo;
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
      this.tryingToConnect = false;
      this.changeDetectorRef.detectChanges();
    });

    this.electron.fireConnect.subscribe(() => {
      this.onConnectClick();
    });
  }

  protected onConnectClick() {
    if (this.tryingToConnect) return;

    this.tryingToConnect = true;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.tryingToConnect = false;
      this.changeDetectorRef.detectChanges();
    }, 2500);

    const validationError = this.hasInputValidationErrors();
    if (validationError) {
      this.drawerVisible = true;
      this.issueDialogVisible = true;
      return;
    }

    const mapPool: MapInfoSend[] = [];
    if (this.tournamentInfo.showMappool) {
      mapPool.push(this.translateMapInfo(this.leftMap));
      mapPool.push(this.translateMapInfo(this.centerMap));
      mapPool.push(this.translateMapInfo(this.rightMap));
    }

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
        mapInfo: mapPool,
      },
      //seeding info
      {
        left: this.seriesInfo.seedingLeft,
        right: this.seriesInfo.seedingRight,
      },
      this.tournamentInfo,
      this.hotkeys,
      this.sponsorInfo,
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
    this.localStorageService.setItem("sponsors", this.sponsorInfo);
  }

  protected onExtrasClick() {
    this.extrasDialogVisible = true;
  }

  protected onMapbanClick() {
    this.tryingToConnect = true;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.tryingToConnect = false;
      this.changeDetectorRef.detectChanges();
    }, 2500);
    this.http
      .post(
        "https://mapban.valospectra.com/api/createSession",
        {
          teams: [this.leftTeamInfo, this.rightTeamInfo],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Organization-Key": this.basicInfo.key,
          },
        },
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.tryingToConnect = false;
            this.extrasIssueMessage = "";
            this.changeDetectorRef.detectChanges();
            this.electron.openExternalLink(
              `https://mapban.valospectra.com/session/org/${response.sessionIdentifier}/${response.sessionSecret}`,
            );
          } else {
            this.extrasIssueMessage =
              "Failed to create Mapban session. Please check your inputs and try again.";
            console.error("Failed to create Mapban session:", response);
          }
        },
        error: (error) => {
          if (error.status === 0) {
            this.extrasIssueMessage =
              "Error creating Mapban session. Couldn't reach Spectra server.";
          } else {
            this.extrasIssueMessage =
              "Error creating Mapban session. Please check your inputs and try again.";
          }
          console.error("Error creating Mapban session:", error);
        },
      });
  }

  previewCode: string = "";
  protected onPreviewClick() {
    this.tryingToConnect = true;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.tryingToConnect = false;
      this.changeDetectorRef.detectChanges();
    }, 2500);

    const mapPool: MapInfoSend[] = [];
    if (this.tournamentInfo.showMappool) {
      mapPool.push(this.translateMapInfo(this.leftMap));
      mapPool.push(this.translateMapInfo(this.centerMap));
      mapPool.push(this.translateMapInfo(this.rightMap));
    }

    this.http
      .put(`https://eu.valospectra.com:5101/createPreview`, {
        // .put(`http://localhost:5101/createPreview`, {
        type: "preview",
        clientVersion: "1.0.0",
        key: this.basicInfo.key,
        previewCode: this.previewCode,
        leftTeam: this.leftTeamInfo,
        rightTeam: this.rightTeamInfo,
        toolsData: {
          seriesInfo: {
            needed: this.seriesInfo.needed,
            wonLeft: this.seriesInfo.wonLeft,
            wonRight: this.seriesInfo.wonRight,
            mapInfo: mapPool,
          },
          seedingInfo: {
            left: this.seriesInfo.seedingLeft,
            right: this.seriesInfo.seedingRight,
          },
          tournamentInfo: this.tournamentInfo,
          timeoutDuration: this.tournamentInfo.timeoutDuration,
          sponsorInfo: this.sponsorInfo,
        },
      })
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.tryingToConnect = false;
            this.extrasIssueMessage = "";
            this.changeDetectorRef.detectChanges();
            this.previewCode = response.previewCode;
            console.log("Preview code created successfully:", this.previewCode);
            this.electron.openExternalLink(
              `https://auto.valospectra.com/testing?previewCode=${this.previewCode}`,
              // `http://localhost:4200/testing?previewCode=${this.previewCode}`,
            );
          } else {
            this.extrasIssueMessage =
              "Failed to create preview. Please check your inputs and try again.";
            console.error("Failed to create preview code:", response);
          }
        },
        error: (error) => {
          if (error.status === 0) {
            this.extrasIssueMessage = "Failed to create preview. Couldn't reach Spectra server.";
          } else {
            this.extrasIssueMessage =
              "Failed to create preview. Please check your inputs and try again.";
          }
          console.error("Error creating preview code:", error);
        },
      });
  }

  private hasInputValidationErrors(): boolean {
    const issueStates: ValidationState[] = Array.from(this.issueStore.values());
    if (issueStates.includes(ValidationState.INVALID)) {
      return true;
    }
    return false;
  }

  private translateMapInfo(mapInfo: MapInfo): MapInfoSend {
    const mapInfoSend: MapInfoSend = {
      type: mapInfo.type.toLowerCase() as "past" | "present" | "future",
    };

    if (mapInfo.type === "Past" || mapInfo.type === "Future") {
      mapInfoSend.map = mapInfo.map;
    }

    if (mapInfo.type === "Past") {
      mapInfoSend.left = {
        score: mapInfo.leftScore || -1,
        logo: this.leftTeamInfo.url,
      };
      mapInfoSend.right = {
        score: mapInfo.rightScore || -1,
        logo: this.rightTeamInfo.url,
      };
    }

    if (mapInfo.type === "Present" || mapInfo.type === "Future") {
      switch (mapInfo.picker) {
        case "left":
          mapInfoSend.logo = this.leftTeamInfo.url;
          break;
        case "right":
          mapInfoSend.logo = this.rightTeamInfo.url;
          break;
        case "decider":
          mapInfoSend.logo = "";
          break;
      }
    }

    return mapInfoSend;
  }

  private scrollToPanel(event: MenuItemCommandEvent) {
    if (!event.item?.fragment) return;

    const element = document.getElementById(event.item.fragment);
    if (!element) return;

    const box = element.getBoundingClientRect();
    if (!box) return;

    this.drawerVisible = false;
    window.scrollTo({
      top: box.top + window.scrollY,
      left: box.left + window.scrollX,
      behavior: "smooth",
    });
    element.classList.add("animate-[pulse_0.5s_infinite]");
    setTimeout(() => {
      element.classList.remove("animate-[pulse_0.5s_infinite]");
    }, 1500);
  }

  // Something about closing the drawer or scrolling closes items we want to always be expanded
  public forceExpandPanelItems() {
    for (const item of this.checklistItems) {
      if (item.items) {
        item.expanded = true;
      }
    }
  }

  public onPanelValidationChanged(state: ValidationState, id: string) {
    let element;
    //finding the element in the 2-layered array
    for (const e of this.checklistItems) {
      if (e.fragment == id) {
        element = e;
        break;
      }
      if (e.items) {
        for (const e2 of e.items) {
          if (e2.fragment == id) {
            element = e2;
            break;
          }
        }
        if (element) break;
      }
    }
    if (!element) return;

    switch (state) {
      case ValidationState.VALID:
        element.icon = "pi pi-check";
        element.iconStyle = { color: "green" };
        break;
      case ValidationState.INVALID:
        element.icon = "pi pi-times";
        element.iconStyle = { color: "red" };
        break;
      case ValidationState.OPTIONAL:
        element.icon = "pi pi-circle";
        element.iconStyle = { color: "gray" };
        break;
    }

    this.issueStore.set(id, state);

    this.validationIssuesDetected = this.hasInputValidationErrors();
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

//#region Type definition
export type BasicInfo = {
  name: string;
  key: string;
  groupCode: string;
  ingestIp: string | undefined;
};

export type TeamInfo = {
  name: string;
  tricode: string;
  url: string;
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
  enabled: {
    spikePlanted: boolean;
    techPause: boolean;
    leftTimeout: boolean;
    rightTimeout: boolean;
  };
};

export type SponsorInfo = {
  enabled: boolean;
  duration: number;
  sponsors: string[];
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
  picker: "left" | "right" | "decider";
};

type FutureMapInfo = BaseMapInfo & {
  type: "Future";
  map: string | undefined;
  picker: "left" | "right" | "decider";
};

export type MapInfo = PastMapInfo | PresentMapInfo | FutureMapInfo;

type MapInfoSend = {
  type: "past" | "present" | "future";
  // Past, Future - map name
  map?: string;
  // Past - score
  left?: {
    score: number;
    logo: string;
  };
  // Past - score
  right?: {
    score: number;
    logo: string;
  };
  // Present, Future - picker
  logo?: string;
};
//#endregion
