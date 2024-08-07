import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron'
import { ConnectorService } from './connectorService';
import { setPlayerName } from '../main';
import { DataTypes, FormattingService, IFormattedData, IFormattedRoundInfo, IFormattedScore } from './formattingService';
import log from 'electron-log';

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
let enabled = false;

export class GameEventsService {
  private gepApi!: overwolf.packages.OverwolfGameEventPackage;
  private valorantId: number = VALORANT_ID;
  private isFirstDetection: boolean = true;
  private connService = ConnectorService.getInstance();
  private formattingService = FormattingService.getInstance();
  private currRoundNumber: number = 0;
  private win: any;

  constructor() {
    this.registerOverwolfPackageManager();
  }

  public registerGame(gepGamesId: number) {
    this.valorantId = gepGamesId;
  }

  public registerWindow(win: any) {
    this.win = win;
  }

  public async setRequiredFeaturesValorant() {
    // https://overwolf.github.io/api/live-game-data/supported-games/valorant
    await this.gepApi.setRequiredFeatures(VALORANT_ID, ["match_info", "me"]);
  }

  private registerOverwolfPackageManager() {
    app.overwolf.packages.on('ready', (e, packageName, version) => {
      if (packageName !== 'gep') {
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

    this.gepApi.on('game-detected', async (e, gameId, name, gameInfo) => {
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
      this.setRequiredFeaturesValorant();
      enabled = true;
    });

    this.gepApi.on('new-info-update', (e, gameId, ...args) => {
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

    this.gepApi.on('new-game-event', (e, gameId, ...args) => {
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

    this.gepApi.on('error', (e, gameId, error, ...args) => {
      log.error("GEP Error: ", error);
      enabled = false;
    });
  }

  processInfoUpdate(data: any) {
    if (data.gameId !== VALORANT_ID) return;

    this.checkPostEndGameInfo(data);

    if (data.key.includes("scoreboard")) {

      const value = JSON.parse(data.value);
      if (value.name == undefined || value.name == "") return;
      const formatted: IFormattedData = this.formattingService.formatScoreboardData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "kill_feed") {

      const value = JSON.parse(data.value);
      const formatted: IFormattedData = this.formattingService.formatKillfeedData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "round_phase") {

      const formatted: IFormattedData = this.formattingService.formatRoundData(data.value, this.currRoundNumber);
      if ((formatted.data as IFormattedRoundInfo).roundPhase == "end") {
        this.waitForPostEndInfo();
      }
      else {
        this.connService.sendToIngest(formatted);
      }

    } else if (data.key.includes("roster")) {

      const value = JSON.parse(data.value);
      if (value.name == undefined || value.name == "") return;
      const formatted: IFormattedData = this.formattingService.formatRosterData(value, data.key);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "player_name") {

      log.info(`Detected player name: ${data.value}`);
      setPlayerName(data.value);

    } else if (data.key === "team") {

      const toSend: IFormattedData = { type: DataTypes.TEAM_IS_ATTACKER, data: true };

      if (data.value === "defense") {
        toSend.data = false;
      } else if (data.value === "attack") {
        toSend.data = true;
      }

      this.connService.sendToIngest(toSend);

    } else if (data.key === "round_number") {

      this.currRoundNumber = +data.value;

    } else if (data.key === "health") {

      // Nothing yet

    } else if (data.key === "score") {

      const toSend: IFormattedData = { type: DataTypes.SCORE, data: JSON.parse(data.value) as IFormattedScore }
      this.connService.sendToIngest(toSend);


    } else if (data.key === "map") {

      // Why do we do this? The TS enum on the server side does not like "Infinity"
      // as one of its members because it counts as a numeric name :)
      if (data.value === "Infinity") {
        data.value = "Infinityy";
      }

      const toSend: IFormattedData = { type: DataTypes.MAP, data: data.value }
      this.connService.sendToIngest(toSend);

    } else if (data.key === "observing") {

      log.info(`Observing events now accessible (${data.value})`);
      const toSend: IFormattedData = { type: DataTypes.OBSERVING, data: data.value }
      this.connService.sendToIngest(toSend);

    } else if (data.key === "match_outcome") {

      log.info("Match outcome: ", data.value);
      this.connService.handleMatchEnd();

    } else {
      log.info("Unhandled: ", data);
    }
  }

  processGameUpdate(data: any) {
    this.checkPostEndGameInfo(data);
    
    if (data.key === "match_start") {
      const toSend: IFormattedData = { type: DataTypes.MATCH_START, data: true };
      this.connService.sendToIngest(toSend);
    } else if (data.key === "spike_planted") {
      const toSend: IFormattedData = { type: DataTypes.SPIKE_PLANTED, data: true };
      this.connService.sendToIngest(toSend);
    } else if (data.key === "spike_detonated") {
      const toSend: IFormattedData = { type: DataTypes.SPIKE_DETONATED, data: true };
      if (this.isWaitingForPostEndInfo) {
        this.postEndSpikeInfo(toSend);
      }
      else {
        this.connService.sendToIngest(toSend);
      }
    } else if (data.key === "spike_defused") {
      const toSend: IFormattedData = { type: DataTypes.SPIKE_DEFUSED, data: true };
      if (this.isWaitingForPostEndInfo) {
        this.postEndSpikeInfo(toSend);
      }
      else {
        this.connService.sendToIngest(toSend);
      }
    } else {
      log.info("Unhandled game update:", data);
    }
  }

  private maxRoundEndDelay: number = 50; //in ms
  private roundEndSendTimer?: NodeJS.Timeout; //timeout index in case we need to cancel
  private isWaitingForPostEndInfo: boolean = false;

  waitForPostEndInfo() {
    this.isWaitingForPostEndInfo = true;
    this.roundEndSendTimer = setTimeout(() => {
      this.isWaitingForPostEndInfo = false;
      this.sendDelayedEndData(this.connService, this.formattingService)
    }, this.maxRoundEndDelay);
  }

  postEndSpikeInfo(spikeData: IFormattedData) {
    this.connService.sendToIngest(spikeData);
    this.sendDelayedEndDataEarly();
  }

  sendDelayedEndDataEarly() {
    clearTimeout(this.roundEndSendTimer);
    this.sendDelayedEndData(this.connService, this.formattingService);
  }

  sendDelayedEndData(connService: ConnectorService, formattingService: FormattingService) {
    delete this.roundEndSendTimer;
    this.isWaitingForPostEndInfo = false;
    connService.sendToIngest(formattingService.formatRoundData("end", this.currRoundNumber));
  }

  checkPostEndGameInfo(data: any) {
    //checks if we are waiting for post end spike info
    //if we are, then checks if the event type is any that we are waiting for
    //if an event we do not want comes, then we send the end round data early, since spike detonation/defusal wasnt the round win condition
    if (this.isWaitingForPostEndInfo) {
      if (data.key != "score" && data.key != "spike_detonated" && data.key != "spike_defused" && !data.key.includes("scoreboard")) {
        this.sendDelayedEndDataEarly();
      }
    }
  }


}
