import { app } from 'electron';
import log from 'electron-log';
import * as io from "socket.io-client";
import { messageBox, messageBoxType, setInputAllowed, setStatus } from '../main';
import { DataTypes, IAUthenticationData, IFormattedData } from './formattingService';

export interface AuthTeam {
  name: string,
  tricode: string,
  url: string,
  attackStart: boolean
}

export class ConnectorService {
    private INGEST_SERVER_URL = "https://localhost:5100"
    private OBS_NAME = "";
    private GROUP_CODE = "";
    private LEFT_TEAM: AuthTeam = {
        name: '',
        tricode: '',
        url: '',
        attackStart: false
    };
    private RIGHT_TEAM: AuthTeam = {
        name: '',
        tricode: '',
        url: '',
        attackStart: false
    };

    private connected = false;
    private unreachable = false;
    private ws?: io.Socket;
    private win!: Electron.Main.BrowserWindow;

    private static instance: ConnectorService;

    private constructor() { }

    public static getInstance(): ConnectorService {
        if (ConnectorService.instance == null) ConnectorService.instance = new ConnectorService();
        return ConnectorService.instance;
    }

    handleAuthProcess(ingestIp: string, obsName: string, groupCode: string, leftTeam: AuthTeam, rightTeam: AuthTeam, key: string, win: Electron.Main.BrowserWindow) {
        if (ingestIp.startsWith("http://")) {this.INGEST_SERVER_URL = `${ingestIp}:5100`;}
        else {this.INGEST_SERVER_URL = `https://${ingestIp}:5100`;}
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
        this.ws = io.connect(this.INGEST_SERVER_URL, { reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000, rejectUnauthorized: false });

        this.ws.once('obs_logon_ack', (msg) => {
            const json = JSON.parse(msg.toString());

            if (json.type === DataTypes.AUTH) {
                if (json.value === true) {
                    log.info('Authentication successful!');
                    this.win.setTitle(`Spectra Client | Connected with Group ID: ${this.GROUP_CODE}`);
                    this.connected = true;
                    setStatus("Connected");
                    setInputAllowed(false);
                    this.websocketSetup();
                } else {
                    log.info('Authentication failed!');
                    messageBox("Spectra Client - Error", `Connection failed, reason: ${json.reason}`, messageBoxType.ERROR);
                    this.win.setTitle(`Spectra Client | Connection failed`);
                    this.setDisconnected();
                    this.ws?.disconnect();
                    setStatus(`Connection failed - ${json.reason}`);
                }
            }
        });

        this.ws.on('close', () => {
            log.info('Connection to spectra server closed');
            if (this.unreachable === true) {
                this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);

                messageBox("Spectra Client - Error", "Spectra server not reachable!", messageBoxType.ERROR);
            } else {
                this.win.setTitle(`Spectra Client | Connection closed`);
            }
            this.setDisconnected();
            this.ws?.disconnect();
        });

        this.ws.on('error', (e: any) => {
            log.info('Failed connection to spectra server - is it up?');
            if (e.code === "ECONNREFUSED") {
                this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);
                this.unreachable = true;
            } else {
                this.win.setTitle(`Spectra Client | Connection failed`);
            }
            log.error(e);
        });

        this.ws.io.on('reconnect_attempt', (attempt: number) => {
            log.info(`Reconnecting to spectra server, attempt ${attempt}`);
            this.win.setTitle(`Spectra Client | Connection lost, attempting reconnect...`);
        });
        
        this.ws.io.on('reconnect', () => {
            log.info(`Spectra Client | Reconnected`);
        });

        const logonData: IAUthenticationData = {
            type: DataTypes.AUTH,
            clientVersion: app.getVersion(),
            obsName: this.OBS_NAME,
            key: key,
            groupCode: this.GROUP_CODE,
            leftTeam: this.LEFT_TEAM,
            rightTeam: this.RIGHT_TEAM,
        }

        this.ws.emit('obs_logon', JSON.stringify(logonData));
    }


    private websocketSetup() {
        this.ws?.on('message', (msg) => {
            const json = JSON.parse(msg.toString());
            log.info(json);
        });
    }

    sendToIngest(formatted: IFormattedData) {
        if (this.connected) {
            const toSend = { obsName: this.OBS_NAME, groupCode: this.GROUP_CODE, ...formatted };
            this.ws!.emit("obs_data", JSON.stringify(toSend));
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
    }

    isConnected() {
        return this.connected;
    }
}