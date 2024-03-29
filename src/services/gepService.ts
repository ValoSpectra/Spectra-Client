import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron'
import { ConnectorService } from './connectorService';
import { setPlayerName } from '../main';
import { DataTypes, FormattingService, IFormattedData, IFormattedScore } from './formattingService';

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
let enabled = false;

export class GameEventsService {
  private gepApi!: overwolf.packages.OverwolfGameEventPackage;
  private gepGamesId: number = VALORANT_ID;
  private connService = ConnectorService.getInstance();
  private formattingService = FormattingService.getInstance();
  private currRoundNumber: number = 0;

  constructor() {
    this.registerOverwolfPackageManager();
  }

  public registerGame(gepGamesId: number) {
    this.gepGamesId = gepGamesId;
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

      this.onGameEventsPackageReady();
    });
  }

  private async onGameEventsPackageReady() {
    this.gepApi = app.overwolf.packages.gep;

    this.gepApi.removeAllListeners();

    this.gepApi.on('game-detected', (e, gameId, name, gameInfo) => {
      if (!(this.gepGamesId === gameId)) {
        // Don't connect to non-Valorant games
        return;
      }
      e.enable();
      console.log("Valorant detected as running");
      enabled = true;

      this.setRequiredFeaturesValorant();
    });

    this.gepApi.on('new-info-update', (e, gameId, ...args) => {
      if (enabled) {
        for (const data of args) {
          this.processGameEvent(data);
        }
      }
    });

    this.gepApi.on('new-game-event', (e, gameId, ...args) => {
      console.log("New game event");
      for (const data of args) {
        if (data.key === "match_start") {
          const toSend: IFormattedData = { type: DataTypes.MATCH_START, data: true };
          this.connService.sendToIngest(toSend);
        } else if (data.key === "spike_planted") {
          console.log(data);
          const toSend: IFormattedData = { type: DataTypes.SPIKE_PLANTED, data: true }
          this.connService.sendToIngest(toSend);
        } else if (data.key === "spike_detonated") {
          console.log(data);
          const toSend: IFormattedData = { type: DataTypes.SPIKE_DETONATED, data: true }
          this.connService.sendToIngest(toSend);
        } else if (data.key === "spike_defused") {
          console.log(data);
          const toSend: IFormattedData = { type: DataTypes.SPIKE_DEFUSED, data: true }
          this.connService.sendToIngest(toSend);
        } else {
          console.log(data);
        }
      }
    });

    this.gepApi.on('error', (e, gameId, error, ...args) => {
      console.log("error");
      enabled = false;
    });
  }

  processGameEvent(data: any) {
    if (data.gameId !== VALORANT_ID) return;

    if (data.key.startsWith("scoreboard")) {

      const value = JSON.parse(data.value);
      // Only process teammate events
      if (value.teammate !== true) return;
      const formatted: IFormattedData = this.formattingService.formatScoreboardData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "kill_feed") {

      const value = JSON.parse(data.value);
      // Only process KILLS from teammates
      if (value.is_attacker_teammate === false) return;
      const formatted: IFormattedData = this.formattingService.formatKillfeedData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "round_phase") {

      const formatted: IFormattedData = this.formattingService.formatRoundData(data.value, this.currRoundNumber);
      this.connService.sendToIngest(formatted);

    } else if (data.key.startsWith("roster")) {

      const value = JSON.parse(data.value);
      // Only pcoress roster of team
      if (value.teammate === false) return;
      const formatted: IFormattedData = this.formattingService.formatRosterData(value, data.key);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "player_name") {

      console.log(`Detected player name: ${data.value}`);
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

      const toSend: IFormattedData = { type: DataTypes.MAP, data: data.value }
      this.connService.sendToIngest(toSend);

    } else {
      console.log(`Unhandled:`);
      console.log(data);
    }
  }
}
