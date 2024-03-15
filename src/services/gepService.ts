import { app as electronApp } from 'electron';
import { overwolf } from '@overwolf/ow-electron' // TODO: wil be @overwolf/ow-electron

const app = electronApp as overwolf.OverwolfApp;
const VALORANT_ID = 21640;

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

  /**
   * Register listeners for the GEP Package once it is ready
   *
   * @param {overwolf.packages.OverwolfGameEventPackage} gep The GEP Package instance
   */
  private async onGameEventsPackageReady() {
    // Save package into private variable for later access
    this.gepApi = app.overwolf.packages.gep;

    this.gepApi.removeAllListeners();

    this.gepApi.on('game-detected', (e, gameId, name, gameInfo) => {
      // If the game isn't in our tracking list

      if (!this.gepGamesId.includes(gameId)) {
        // Don't connect to non-Valorant games
        return;
      }
      e.enable();
      this.activeGame = gameId;
      
      console.log("game-detected");

      this.setRequiredFeaturesValorant();
    });

    // When a new Info Update is fired
    this.gepApi.on('new-info-update', (e, gameId, ...args) => {
        console.log("new-info-update");
        console.log(args);
    });

    // When a new Game Event is fired
    this.gepApi.on('new-game-event', (e, gameId, ...args) => {
        console.log("new-game-event");
        console.log(args);
    });

    // If GEP encounters an error
    this.gepApi.on('error', (e, gameId, error, ...args) => {
        console.log("error");
      this.activeGame = 0;
    });
  }
}