import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron'
import { ConnectorService } from './connectorService';
import { setPlayerName } from '../main';

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
let enabled = false;

export interface IFormattedData {
  type: string,
  data: string | boolean,
}

export enum DataTypes {
  SCOREBOARD = "scoreboard",
  KILLFEED = "killfeed",
  ROSTER = "roster"
}

export class GameEventsService {
  private gepApi!: overwolf.packages.OverwolfGameEventPackage;
  private gepGamesId: number = VALORANT_ID;
  private connService = ConnectorService.getInstance();

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
      console.log(args);
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
      const formatted: IFormattedData = formatScoreboardData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "kill_feed") {

      const value = JSON.parse(data.value);
      // Only process KILLS from teammates
      if (value.is_attacker_teammate === false) return;
      const formatted: IFormattedData = formatKillfeedData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "match_start") {

      const toSend: IFormattedData = { type: "matchStart", data: true };
      this.connService.sendToIngest(toSend);

    } else if (data.key === "round_phase") {

      const value = JSON.parse(data);
      const toSend: IFormattedData = { type: "roundPhase", data: value };
      this.connService.sendToIngest(toSend);

    } else if (data.key.startsWith("roster")) {

      const value = JSON.parse(data.value);
      // Only pcoress roster of team
      if (value.teammate === false) return;
      const formatted: IFormattedData = formatRosterData(value);
      this.connService.sendToIngest(formatted);

    } else if (data.key === "player_name") {

      console.log(`Detected player name: ${data.value}`);
      setPlayerName(data.value);

    }
  }
}

function formatScoreboardData(value: any): IFormattedData  {
  let formatted: any = {};

  const nameSplit = value.name.split(" #");
  formatted.name = nameSplit[0];
  formatted.tagline = nameSplit[1];

  formatted.agentInternal = value.character;
  formatted.isAlive = value.alive;

  formatted.initialShield = value.shield * 25;
  formatted.scoreboardWeaponInternal = value.weapon;

  formatted.currUltPoints = value.ult_points;
  formatted.maxUltPoints = value.ult_max;
  formatted.money = value.money;

  formatted.kills = value.kills;
  formatted.deaths = value.deaths;
  formatted.assists = value.assists;

  const toReturn: IFormattedData = { type: DataTypes.SCOREBOARD, data: "" };
  toReturn.data = formatted;

  return toReturn;
}

function formatKillfeedData(value: any): IFormattedData {
  let formatted: any = {};

  formatted.attacker = value.attacker;
  formatted.victim = value.victim;
  formatted.weaponKillfeedInternal = value.weapon;
  formatted.headshotKill = value.headshot;

  formatted.assists = [];
  value.assist1 !== "" ? formatted.assists.push(value.assist1) : undefined;
  value.assist2 !== "" ? formatted.assists.push(value.assist2) : undefined;
  value.assist3 !== "" ? formatted.assists.push(value.assist3) : undefined;
  value.assist4 !== "" ? formatted.assists.push(value.assist4) : undefined;

  formatted.isTeamkill = value.is_victim_teammate;

  const toReturn: IFormattedData = { type: DataTypes.KILLFEED, data: "" };
  toReturn.data = formatted;

  return toReturn;
}

function formatRosterData(value: any): IFormattedData {
  let formatted: any = {};

  const nameSplit = value.name.split(" #");
  formatted.name = nameSplit[0];
  formatted.tagline = nameSplit[1];

  formatted.agentInternal = value.character;
  formatted.locked = value.locked;
  formatted.rank = value.rank;

  const toReturn: IFormattedData = { type: DataTypes.ROSTER, data: "" };
  toReturn.data = formatted;

  return toReturn;
}