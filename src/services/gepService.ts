import { overwolf } from "@overwolf/ow-electron";
import { app as electronApp } from "electron";
import log from "electron-log";
import { fireConnect, setPlayerName, setStatus } from "../main";
import { ConnectorService } from "./connectorService";
import {
  DataTypes,
  FormattingService,
  IFormattedData,
  IFormattedRoundInfo,
  IFormattedScore,
  IFormattedScoreboard,
} from "./formattingService";
import HotkeyService from "./hotkeyService";

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
let enabled = false;
let auxiliary = false;

export class GameEventsService {
  private gepApi!: overwolf.packages.OverwolfGameEventPackage;
  private overwolfPackageListenerRegistered: boolean = false;
  private valorantId: number = VALORANT_ID;
  private isFirstDetection: boolean = true;
  private connService = ConnectorService.getInstance();
  private formattingService = FormattingService.getInstance();
  public currRoundNumber: number = 0;
  private currScene: string = "";
  private currMatchId: string = "";
  private localPlayerId: string = "";
  private win: any;

  constructor(isAuxiliary: boolean) {
    app.overwolf.packages.on("failed-to-initialize", (e, info) => {
      log.info(`Failed to initialize package ${info}`);
    });
    app.overwolf.packages.on("package-update-pending", (e, info) => {
      for (const pkg of info) {
        if (pkg.name !== "gep") {
          break;
        }
        log.info(`GEP Updating... New version: ${pkg.version}`);
        this.win?.setTitle("Spectra Client | GEP Updating...");
      }
    });
    auxiliary = isAuxiliary;
  }

  public registerGame(gepGamesId: number) {
    this.valorantId = gepGamesId;
  }

  public registerWindow(win: any) {
    this.win = win;
  }

  public async setRequiredFeaturesValorant() {
    // https://overwolf.github.io/api/live-game-data/supported-games/valorant
    await this.gepApi.setRequiredFeatures(VALORANT_ID, ["match_info", "me", "game_info"]);
  }

  public registerOverwolfPackageManager() {
    if (this.overwolfPackageListenerRegistered) {
      return;
    }

    app.overwolf.packages.on("ready", (e, packageName, version) => {
      if (packageName !== "gep") {
        return;
      }
      log.info(`GEP version ${version} ready!`);
      this.win!.setTitle(`Spectra Client | Ready (GEP: ${version})`);

      this.onGameEventsPackageReady();
    });
  }

  private async onGameEventsPackageReady() {
    this.gepApi = app.overwolf.packages.gep;

    this.gepApi.removeAllListeners();

    this.setRequiredFeaturesValorant();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.gepApi.on("game-detected", async (e, gameId, name, gameInfo) => {
      log.info(`Game detected: ${gameId} - ${name}`);
      if (!(this.valorantId === gameId)) {
        log.info("Game not Valorant - ignoring");
        return;
      }
      log.info("Game IS Valorant - enabling");
      if (this.isFirstDetection) {
        this.isFirstDetection = false;
      } else {
        this.win!.setTitle(`Spectra Client | Valorant re-detected - Ready`);
      }

      e.enable();
      enabled = true;
    });

    this.gepApi.on("new-info-update", (e, gameId, ...args) => {
      if (enabled) {
        for (const data of args) {
          try {
            this.processInfoUpdate(data);
          } catch (e) {
            log.error("Info update error: ", e);
          }
        }
      }
    });

    this.gepApi.on("new-game-event", (e, gameId, ...args) => {
      if (enabled) {
        for (const data of args) {
          try {
            this.processGameUpdate(data);
          } catch (e) {
            log.error("Game update error: ", e);
          }
        }
      }
    });

    this.gepApi.on("error", (e, gameId, error) => {
      log.error("GEP Error: ", error);
      enabled = false;
    });
  }

  processInfoUpdate(data: any) {
    if (data.gameId !== VALORANT_ID) return;

    if (auxiliary) {
      this.processAuxUpdate(data);
      return;
    }

    if (data.key.includes("scoreboard")) {
      const value = JSON.parse(data.value);
      if (value.name == undefined || value.name == "") return;
      const formatted: IFormattedData = this.formattingService.formatScoreboardData(value);
      this.connService.sendToIngest(formatted);
      return;
    } else if (data.key.includes("roster")) {
      const value = JSON.parse(data.value);
      if (value.name == undefined || value.name == "") return;
      const formatted: IFormattedData = this.formattingService.formatRosterData(value, data.key);
      this.connService.sendToIngest(formatted);
      return;
    }

    let formatted: IFormattedData;
    let toSend: IFormattedData;
    switch (data.key) {
      case "kill_feed":
        const value = JSON.parse(data.value);
        formatted = this.formattingService.formatKillfeedData(value);
        this.connService.sendToIngest(formatted);
        break;

      case "observing":
        toSend = { type: DataTypes.OBSERVING, data: data.value };
        this.connService.sendToIngest(toSend);
        break;

      case "round_number":
        this.currRoundNumber = +data.value;
        break;

      case "round_phase":
        formatted = this.formattingService.formatRoundData(data.value, this.currRoundNumber);
        this.connService.sendToIngest(formatted);
        HotkeyService.getInstance().setRoundPhase(data.value);

        if ((formatted.data as IFormattedRoundInfo).roundPhase === "game_end") {
          this.connService.handleMatchEnd();
        }

        setStatus(`Game Running - Round ${this.currRoundNumber}`);

        break;

      case "match_score":
        toSend = {
          type: DataTypes.SCORE,
          data: JSON.parse(data.value) as IFormattedScore,
        };
        this.connService.sendToIngest(toSend);
        break;

      case "scene":
        this.currScene = data.value;

        switch (this.currScene) {
          case "CharacterSelectPersistentLevel":
            fireConnect();
            setStatus("Character Select");
            break;

          case "MainMenu":
            setStatus("Main Menu");
            break;

          case "Range":
            setStatus("Practice Range");
            break;

          default:
            break;
        }

        break;

      case "game_mode":
        toSend = {
          type: DataTypes.GAME_MODE,
          data: JSON.parse(data.value).mode,
        };

        if (this.connService.isConnected()) {
          this.connService.sendToIngest(toSend);
        } else {
          log.info("Delaying gamemode event by 5 seconds to wait out auto-connect");
          setTimeout(() => {
            this.connService.sendToIngest(toSend);
          }, 5000);
        }

        break;

      case "map":
        // Why do we do this? The TS enum on the server side does not like "Infinity"
        // as one of its members because it counts as a numeric name :)
        if (data.value === "Infinity") {
          data.value = "Infinityy";
        }

        toSend = { type: DataTypes.MAP, data: data.value };

        if (this.connService.isConnected()) {
          this.connService.sendToIngest(toSend);
        } else {
          log.info("Delaying map event by 5 seconds to wait out auto-connect");
          setTimeout(() => {
            this.connService.sendToIngest(toSend);
          }, 5000);
        }

        break;

      case "match_id":
        this.currMatchId = data.value;
        break;

      case "player_name":
        log.info(`Detected player name: ${data.value}`);
        setPlayerName(data.value);
        break;

      case "health":
      case "abilities":
      case "player_id":
      case "state":
      case "score":
      case "agent":
      case "team":
      case "match_outcome":
      case "pseudo_match_id":
      case "region":
      case "planted_site":
      case "is_pbe":
        // Irrelevant, ignore
        break;

      default:
        log.info("Unhandled info update:", data);
        break;
    }
  }

  processGameUpdate(data: any) {
    if (data.gameId !== VALORANT_ID) return;
    if (auxiliary) {
      this.processAuxUpdate(data);
      return;
    }

    let toSend: IFormattedData;
    switch (data.key) {
      case "match_start":
        toSend = { type: DataTypes.MATCH_START, data: this.currMatchId };
        this.connService.sendToIngest(toSend);
        setStatus("Game Started");
        break;

      case "spike_planted":
        toSend = { type: DataTypes.SPIKE_PLANTED, data: true };
        this.connService.sendToIngest(toSend);
        break;

      case "spike_detonated":
        toSend = { type: DataTypes.SPIKE_DETONATED, data: true };
        this.connService.sendToIngest(toSend);
        break;

      case "spike_defused":
        toSend = { type: DataTypes.SPIKE_DEFUSED, data: true };
        this.connService.sendToIngest(toSend);
        break;

      case "match_end":
        // Kill connection
        this.connService.handleMatchEnd();
        break;

      // Useless events
      case "scoreboard_screen":
      // I do not know why we are getting a duplicate of kill feeds here now
      case "kill_feed":
      case "shop":
        break;

      default:
        log.info("Unhandled game update:", data);
        break;
    }
  }

  processAuxUpdate(data: any) {
    if (data.key.includes("scoreboard")) {
      const value = JSON.parse(data.value);
      if (value.name == undefined || value.name == "") return;
      data = JSON.parse(data.value);
      if (data.is_local) {
        const formatted: IFormattedData = this.formattingService.formatScoreboardData(value);
        formatted.type = DataTypes.AUX_SCOREBOARD;
        this.localPlayerId = (formatted.data as IFormattedScoreboard).playerId;
        this.connService.setPlayerId(this.localPlayerId);
        this.connService.sendToIngestAux(formatted);
        return;
      }
    } else if (data.key.includes("roster")) {
      const value = JSON.parse(data.value);
      if (value.local) {
        this.localPlayerId = value.player_id;
        this.connService.setPlayerId(this.localPlayerId);
      }
      return;
    }

    let formatted: IFormattedData;
    switch (data.key) {
      case "health":
        this.connService.setPlayerHealth(+data.value);
        break;

      case "abilities":
        const valueObject = JSON.parse(data.value);
        formatted = {
          type: DataTypes.AUX_ABILITIES,
          data: {
            grenade: valueObject["C"],
            ability_1: valueObject["Q"],
            ability_2: valueObject["E"],
          },
        };
        this.connService.sendToIngestAux(formatted);
        break;

      case "round_phase":
        if (data.value === "end") {
          // Try connecting on round end in case someone fixes their connection settings (or restarts)
          fireConnect();
        } else if (data.value === "game_end") {
          this.connService.handleMatchEnd();
        }
        break;

      case "match_start":
        if (this.currScene !== "Range") {
          // Wait 1 seconds before firing connect to give observer time to send match ID
          setTimeout(() => {
            fireConnect();
          }, 1000);
        }
        break;

      case "player_id":
        this.localPlayerId = data.value;
        this.connService.setAndSavePlayerId(this.localPlayerId);
        break;

      case "match_id":
        this.currMatchId = data.value;
        this.connService.setMatchId(this.currMatchId);
        break;

      case "player_name":
        log.info(`Detected player name: ${data.value}`);
        setPlayerName(data.value);
        break;

      default:
        break;
    }
  }
}
