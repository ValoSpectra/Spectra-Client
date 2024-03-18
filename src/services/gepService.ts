import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron' // TODO: wil be @overwolf/ow-electron

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
const DATA_PROCESSOR_URL = "http://localhost:5100/ingest";
let AUTH_ID = "";
let enabled = false;

/**
 * Service used to register for Game Events,
 * receive games events, and then send them to a window for visual feedback
 *
 */
export class GameEventsService {
  private gepApi!: overwolf.packages.OverwolfGameEventPackage;
  private activeGame = 0;
  private gepGamesId: number[] = [];

  constructor() {
    this.registerOverwolfPackageManager();
  }

  public registerGames(gepGamesId: number[]) {
    this.gepGamesId = gepGamesId;
  }

  /**
   *
   */
  public async setRequiredFeaturesValorant() {
    await this.gepApi.setRequiredFeatures(VALORANT_ID, ["match_info"]);
  }

  /**
   *
   */
  public async getInfoForActiveGame(): Promise<any> {
    if (this.activeGame == 0) {
      return 'getInfo error - no active game';
    }

    return await this.gepApi.getInfo(this.activeGame);
  }

  /**
   * Register the Overwolf Package Manager events
   */
  private registerOverwolfPackageManager() {
    // Once a package is loaded
    app.overwolf.packages.on('ready', (e, packageName, version) => {
      // If this is the GEP package (packageName serves as a UID)
      if (packageName !== 'gep') {
        return;
      }

      // Prepare for Game Event handling
      this.onGameEventsPackageReady();
    });
  }

  setTrackId(trackId: string) {
    AUTH_ID = trackId;
    enabled = true;
  }

  private async onGameEventsPackageReady() {
    this.gepApi = app.overwolf.packages.gep;

    this.gepApi.removeAllListeners();
    const valoInfo = await this.gepApi.getInfo(VALORANT_ID);
    if (valoInfo.success === true) {
      console.log("Valorant is already running - this app should ideally be started BEFORE Valorant to prevent issues with incorrect or no data!");
    }

    this.gepApi.on('game-detected', (e, gameId, name, gameInfo) => {
      if (!this.gepGamesId.includes(gameId)) {
        // Don't connect to non-Valorant games
        return;
      }
      e.enable();
      this.activeGame = gameId;
      console.log("Valorant detected as running");

      this.setRequiredFeaturesValorant();
    });

    // When a new Info Update is fired
    this.gepApi.on('new-info-update', (e, gameId, ...args) => {
      if (enabled) {
        for (const data of args) {
          this.processGameEvent(data);
        }
      }
    });

    // When a new Game Event is fired
    this.gepApi.on('new-game-event', (e, gameId, ...args) => {
      console.log("New game event");
    });

    // If GEP encounters an error
    this.gepApi.on('error', (e, gameId, error, ...args) => {
      console.log("error");
      this.activeGame = 0;
      enabled = false;
    });
  }

  processGameEvent(data: any) {
    if (data.gameId !== VALORANT_ID) return;

    if (data.key.startsWith("scoreboard")) {

      const value = JSON.parse(data.value);
      // Only process teammate events
      if (value.teammate !== true) return;
      const formatted = formatScoreboardData(value);
      postToProcessor(formatted);

    } else if (data.key === "kill_feed") {

      const value = JSON.parse(data.value);
      // Only process KILLS from teammates
      if (value.is_attacker_teammate === false) return;
      const formatted = formatKillfeedData(value);
      postToProcessor(formatted);

    } else if (data.key === "match_start") {

      const toSend = { type: "matchStart", data: true };
      postToProcessor(toSend);

    } else if (data.key === "round_phase") {

      const value = JSON.parse(data);
      const toSend = { type: "roundPhase", data: value };
      postToProcessor(toSend);

    } else if (data.key.startsWith("roster")) {

      const value = JSON.parse(data.value);
      // Only pcoress roster of team
      if (value.teammate === false) return;
      const formatted = formatRosterData(value);
      postToProcessor(formatted);

    }
  }
}

function formatScoreboardData(value: any) {
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

  formatted.isSubmitter = value.is_local;

  const toReturn: any = { type: "scoreboard" };
  toReturn.data = formatted;

  return toReturn;
}

function formatKillfeedData(value: any) {
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

  const toReturn: any = { type: "killfeed" };
  toReturn.data = formatted;

  return toReturn;
}

function formatRosterData(value: any) {
  let formatted: any = {};

  const nameSplit = value.name.split(" #");
  formatted.name = nameSplit[0];
  formatted.tagline = nameSplit[1];

  formatted.agentInternal = value.character;
  formatted.locked = value.locked;
  formatted.rank = value.rank;
  formatted.isSubmitter = value.local;

  const toReturn: any = { type: "roster" };
  toReturn.data = formatted;

  return toReturn;
}

function postToProcessor(object: any) {
  // Simple catch instead because fire and forget is desireable here
  fetch(DATA_PROCESSOR_URL, {
    method: "POST",
    headers: { "Content-type": "application/json", "X-Auth-Token": AUTH_ID },
    body: JSON.stringify(object),
  }).then((res) => {
    if (res.status === 200) {
      console.log(`Posted ${object.type} update`);
    } else if (res.status === 403) {
      console.log("Not Authorized!");
      enabled = false;
      AUTH_ID = "";
    }
  }).catch((e) => {
    console.log(e);
  });
}