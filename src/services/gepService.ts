import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron' // TODO: wil be @overwolf/ow-electron

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;
const DATA_PROCESSOR_URL = "localhost:5100/ingest";

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
      console.log("Valorant Detected as running");

      this.setRequiredFeaturesValorant();
    });

    // When a new Info Update is fired
    this.gepApi.on('new-info-update', (e, gameId, ...args) => {
        console.log("new-info-update");
        console.log(args);
    });

    // When a new Game Event is fired
    this.gepApi.on('new-game-event', (e, gameId, ...args) => {
      for (const data in args) {
        this.processGameEvent(data);
      }
    });

    // If GEP encounters an error
    this.gepApi.on('error', (e, gameId, error, ...args) => {
        console.log("error");
      this.activeGame = 0;
    });
  }

  processGameEvent(data: any) {
    if (data.gameId !== VALORANT_ID) return;

    if (data.key.startsWith("scoreboard")) {
      const value = JSON.parse(data.value);
      // Only process teammate events
      if (value.teammate !== true) return;
      const formatted = formatScoreboardData(value);
    } else if (data.key === "kill_feed") {
      const value = JSON.parse(data.value);

      // Only process KILLS from teammates
      if (value.is_attacker_teammate === false) return;
      const formatted = formatKillfeedData(value);
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

function postToProcessor(object: any) {
  fetch(DATA_PROCESSOR_URL, {
    method:"POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(object),
  });
}