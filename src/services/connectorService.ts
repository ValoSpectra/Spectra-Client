import { app } from "electron";
import log from "electron-log";
import * as io from "socket.io-client";
import { messageBox, messageBoxType, setInputAllowed, setStatus } from "../main";
import {
  DataTypes,
  IAuthenticationData,
  IAuxAuthenticationData,
  IFormattedAuxScoreboardTeam as IFormattedAuxScoreboardTeammate,
  IFormattedData,
  ISeedingInfo,
  ISeriesInfo,
  ITournamentInfo,
  SocketChannels,
} from "./formattingService";
import HotkeyService from "./hotkeyService";
const storage = require("electron-json-storage");

export interface AuthTeam {
  name: string;
  tricode: string;
  url: string;
  attackStart: boolean;
}

export class ConnectorService {
  private INGEST_SERVER_URL = "https://localhost:5100";
  private OBS_NAME = "";
  private IS_AUX = false;
  private PLAYER_ID = this.getPlayerId();
  private PLAYER_HEALTH = 100;
  private LAST_HEALTH = 0;
  private AUX_SEND_INTERVAL: NodeJS.Timeout | undefined;
  private MATCH_ID = this.getMatchId();
  private GROUP_CODE = "";
  private LEFT_TEAM: AuthTeam = {
    name: "",
    tricode: "",
    url: "",
    attackStart: false,
  };
  private RIGHT_TEAM: AuthTeam = {
    name: "",
    tricode: "",
    url: "",
    attackStart: false,
  };
  private TEAMMATE_STORE: Record<string, IFormattedAuxScoreboardTeammate> = {};
  private TEAMMATE_STORE_UPDATE: boolean = false;

  private connected = false;
  private unreachable = false;
  private ws?: io.Socket;
  private win!: Electron.Main.BrowserWindow;

  private static instance: ConnectorService;

  private constructor() {}

  public static getInstance(): ConnectorService {
    if (ConnectorService.instance == null) ConnectorService.instance = new ConnectorService();
    return ConnectorService.instance;
  }

  handleAuthProcess(
    ingestIp: string,
    obsName: string,
    groupCode: string,
    leftTeam: AuthTeam,
    rightTeam: AuthTeam,
    key: string,
    seriesInfo: ISeriesInfo,
    seedingInfo: ISeedingInfo,
    tournamentInfo: ITournamentInfo,
    timeoutDuration: number,
    win: Electron.Main.BrowserWindow,
  ) {
    if (RegExp("(http|https)://[^/]+:[0-9]+").test(ingestIp)) {
      this.INGEST_SERVER_URL = `${ingestIp}`;
    } else if (ingestIp.includes(":") && !ingestIp.startsWith("http")) {
      this.INGEST_SERVER_URL = `https://${ingestIp}`;
    } else {
      this.INGEST_SERVER_URL = ingestIp.startsWith("http")
        ? `${ingestIp}:5100`
        : `https://${ingestIp}:5100`;
    }
    this.OBS_NAME = obsName;
    this.GROUP_CODE = groupCode.toUpperCase();
    this.LEFT_TEAM = leftTeam;
    this.RIGHT_TEAM = rightTeam;
    this.win = win;

    this.unreachable = false;
    if (this.ws?.connected) {
      this.setDisconnected();
      this.ws.disconnect();
      this.ws = undefined;
    }
    this.ws = io.connect(this.INGEST_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      rejectUnauthorized: false,
    });

    this.ws.once("obs_logon_ack", (msg) => {
      const json = JSON.parse(msg.toString());

      if (json.type === DataTypes.AUTH) {
        if (json.value === true) {
          log.info("Authentication successful!");
          this.win.setTitle(`Spectra Client | Connected with Group ID: ${this.GROUP_CODE}`);
          this.connected = true;
          setStatus("Connected");
          HotkeyService.getInstance().activateAllHotkeys();
          setInputAllowed(false);
          this.websocketSetup();
        } else {
          log.info("Authentication failed!");
          messageBox(
            "Spectra Client - Error",
            `Connection failed, reason: ${json.reason}`,
            messageBoxType.ERROR,
          );
          this.win.setTitle(`Spectra Client | Connection failed`);
          this.setDisconnected();
          this.ws?.disconnect();
          setStatus(`Connection failed - ${json.reason}`);
        }
      }
    });

    this.ws.on("close", () => {
      log.info("Connection to spectra server closed");
      if (this.unreachable === true) {
        this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);

        messageBox("Spectra Client - Error", "Spectra server not reachable!", messageBoxType.ERROR);
      } else {
        this.win.setTitle(`Spectra Client | Connection closed`);
      }
      this.setDisconnected();
      this.ws?.disconnect();
    });

    this.ws.on("error", (e: any) => {
      log.info("Failed connection to spectra server - is it up?");
      if (e.code === "ECONNREFUSED") {
        this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);
        this.unreachable = true;
      } else {
        this.win.setTitle(`Spectra Client | Connection failed`);
      }
      log.error(e);
    });

    this.ws.io.on("reconnect_attempt", (attempt: number) => {
      log.info(`Reconnecting to spectra server, attempt ${attempt}`);
      this.win.setTitle(`Spectra Client | Connection lost, attempting reconnect...`);
    });

    this.ws.io.on("reconnect", () => {
      log.info(`Spectra Client | Reconnected`);
    });

    const logonData: IAuthenticationData = {
      type: DataTypes.AUTH,
      clientVersion: app.getVersion(),
      obsName: this.OBS_NAME,
      key: key,
      groupCode: this.GROUP_CODE,
      leftTeam: this.LEFT_TEAM,
      rightTeam: this.RIGHT_TEAM,
      toolsData: {
        seriesInfo: seriesInfo,
        seedingInfo: seedingInfo,
        tournamentInfo: tournamentInfo,
        timeoutDuration: timeoutDuration,
      },
    };

    this.ws.emit(SocketChannels.OBSERVER_LOGON, JSON.stringify(logonData));
  }

  handleAuxAuthProcess(ingestIp: string, name: string, win: Electron.Main.BrowserWindow) {
    if (RegExp("(http|https)://[^/]+:[0-9]+").test(ingestIp)) {
      this.INGEST_SERVER_URL = `${ingestIp}`;
    } else if (ingestIp.includes(":") && !ingestIp.startsWith("http")) {
      this.INGEST_SERVER_URL = `https://${ingestIp}`;
    } else {
      this.INGEST_SERVER_URL = ingestIp.startsWith("http")
        ? `${ingestIp}:5100`
        : `https://${ingestIp}:5100`;
    }
    this.OBS_NAME = name;
    this.win = win;

    log.info(`Attempting to connect to ${this.INGEST_SERVER_URL} for match ${this.MATCH_ID}`);
    if (this.MATCH_ID === "") {
      log.info("Match ID not set, cannot connect");
      setStatus("No Match ID found, cannot connect");
      this.win.setTitle(`Spectra Client | No Match ID found, cannot connect`);
      return;
    }

    this.unreachable = false;
    if (this.ws?.connected) {
      this.setDisconnected();
      this.ws.disconnect();
      this.ws = undefined;
    }

    this.ws = io.connect(this.INGEST_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      rejectUnauthorized: false,
    });

    this.ws.once("aux_logon_ack", (msg) => {
      const json = JSON.parse(msg.toString());
      if (json.type === DataTypes.AUX_AUTH) {
        if (json.value === true) {
          log.info("Authentication successful!");
          this.win.setTitle(`Spectra Client | Connected, Auxiliary`);
          this.connected = true;
          this.IS_AUX = true;
          setStatus("Connected, Auxiliary");
          setInputAllowed(false);
          this.websocketSetup();
          this.startAuxSendLoop();
          this.saveMatchId(this.MATCH_ID);
        } else {
          log.info("Authentication failed!");
          messageBox(
            "Spectra Client - Error",
            `Connection failed, reason: ${json.reason}`,
            messageBoxType.ERROR,
          );
          this.win.setTitle(`Spectra Client | Connection failed`);
          this.setDisconnected();
          this.ws?.disconnect();
          setStatus(`Connection failed - ${json.reason}`);
        }
      }
    });

    this.ws.on("close", () => {
      log.info("Connection to spectra server closed");
      if (this.unreachable === true) {
        this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);

        messageBox("Spectra Client - Error", "Spectra server not reachable!", messageBoxType.ERROR);
      } else {
        this.win.setTitle(`Spectra Client | Connection closed`);
      }
      this.setDisconnected();
      this.ws?.disconnect();
    });

    this.ws.on("error", (e: any) => {
      log.info("Failed connection to spectra server - is it up?");
      if (e.code === "ECONNREFUSED") {
        this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);
        this.unreachable = true;
      } else {
        this.win.setTitle(`Spectra Client | Connection failed`);
      }
      log.error(e);
    });

    this.ws.io.on("reconnect_attempt", (attempt: number) => {
      log.info(`Reconnecting to spectra server, attempt ${attempt}`);
      this.win.setTitle(`Spectra Client | Connection lost, attempting reconnect...`);
    });

    this.ws.io.on("reconnect", () => {
      log.info(`Spectra Client | Reconnected`);
    });

    const logonData: IAuxAuthenticationData = {
      type: DataTypes.AUX_AUTH,
      clientVersion: app.getVersion(),
      name: this.OBS_NAME,
      matchId: this.MATCH_ID,
      playerId: this.PLAYER_ID,
    };

    this.ws.emit(SocketChannels.AUXILIARY_LOGON, JSON.stringify(logonData));
  }

  private websocketSetup() {
    this.ws?.on("message", (msg) => {
      const json = JSON.parse(msg.toString());
      log.info(json);
    });
  }

  sendToIngest(formatted: IFormattedData) {
    if (this.connected && !this.IS_AUX) {
      const toSend = { obsName: this.OBS_NAME, groupCode: this.GROUP_CODE, ...formatted };
      this.ws!.emit(SocketChannels.OBSERVER_DATA, JSON.stringify(toSend));
    }
  }

  sendToIngestAux(formatted: IFormattedData) {
    if (this.connected) {
      const toSend = { playerId: this.PLAYER_ID, matchId: this.MATCH_ID, ...formatted };
      this.ws!.emit(SocketChannels.AUXILIARY_DATA, JSON.stringify(toSend));
    }
  }

  startAuxSendLoop() {
    this.AUX_SEND_INTERVAL = setInterval(() => {
      if (this.connected) {
        if (this.PLAYER_HEALTH !== this.LAST_HEALTH) {
          this.LAST_HEALTH = this.PLAYER_HEALTH;
          this.sendToIngestAux({
            type: DataTypes.AUX_HEALTH,
            data: this.PLAYER_HEALTH,
          });
        }
        if (this.TEAMMATE_STORE_UPDATE) {
          this.TEAMMATE_STORE_UPDATE = false;
          this.sendToIngestAux({
            type: DataTypes.AUX_SCOREBOARD_TEAM,
            data: JSON.stringify(Object.values(this.TEAMMATE_STORE)),
          });
          this.TEAMMATE_STORE = {};
        }
      }
    }, 300);
  }

  stopAttempts() {
    if (!this.connected) {
      this.ws?.disconnect();
      this.setDisconnected();
    }
  }

  handleMatchEnd() {
    if (this.connected) {
      this.ws?.disconnect();
      this.setDisconnected();
    }
    this.win.setTitle(`Spectra Client | Game ended, connection closed.`);
  }

  setDisconnected() {
    this.connected = false;
    setInputAllowed(true);
    setStatus("Disconnected");
    clearInterval(this.AUX_SEND_INTERVAL);
    this.LAST_HEALTH = 0;
    this.TEAMMATE_STORE_UPDATE = false;
    this.TEAMMATE_STORE = {};
    HotkeyService.getInstance().deactivateAllHotkeys();
  }

  isConnected() {
    return this.connected;
  }

  setMatchId(matchId: string) {
    this.MATCH_ID = matchId;
  }

  setPlayerId(matchId: string) {
    this.PLAYER_ID = matchId;
  }

  setAndSavePlayerId(playerId: string) {
    this.PLAYER_ID = playerId;
    this.savePlayerId();
  }

  setPlayerHealth(health: number) {
    this.PLAYER_HEALTH = health;
  }

  savePlayerId() {
    log.debug(`Saving player ID: ${this.PLAYER_ID}`);
    storage.set("playerId", { playerId: this.PLAYER_ID }, function (error: any) {
      if (error) log.error(error);
    });
  }

  getPlayerId() {
    const retrieved = storage.getSync("playerId");
    if (retrieved == null || Object.keys(retrieved).length == 0) {
      return "";
    } else {
      log.debug(`Retrieved player ID: ${retrieved.playerId}`);
      return retrieved.playerId;
    }
  }

  saveMatchId(matchId: string) {
    log.debug(`Saving match ID: ${matchId}`);
    storage.set("matchId", { matchId: matchId, timestamp: Date.now() }, function (error: any) {
      if (error) log.error(error);
    });
  }

  getMatchId() {
    const retrieved = storage.getSync("matchId");
    if (retrieved == null || Object.keys(retrieved).length == 0) {
      return "";
    }
    // Expire after 2 hours
    if (retrieved.timestamp + 1000 * 60 * 60 * 2 < Date.now()) {
      return "";
    } else {
      log.debug(`Retrieved match ID: ${retrieved.matchId}`);
      return retrieved.matchId;
    }
  }

  updateTeammateStore(playerId: string, data: IFormattedAuxScoreboardTeammate) {
    this.TEAMMATE_STORE[playerId] = data;
    this.TEAMMATE_STORE_UPDATE = true;
  }
}
