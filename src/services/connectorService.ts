import { DataTypes, IFormattedData } from './formattingService';
import { dialog } from 'electron';
import log from 'electron-log';
import * as io from "socket.io-client";

export interface AuthTeam {
  name: string,
  tricode: string,
  url: string,
  attackStart: boolean
}

export class ConnectorService {
    private INGEST_SERVER_URL = "http://localhost:5100"
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

    private enabled = false;
    private unreachable = false;
    private ws?: io.Socket;
    private win!: Electron.Main.BrowserWindow;

    private static instance: ConnectorService;

    private constructor() { }

    public static getInstance(): ConnectorService {
        if (ConnectorService.instance == null) ConnectorService.instance = new ConnectorService();
        return ConnectorService.instance;
    }

    handleAuthProcess(ingestIp: string, obsName: string, groupCode: string, leftTeam: AuthTeam, rightTeam: AuthTeam, win: Electron.Main.BrowserWindow) {
        this.INGEST_SERVER_URL = `http://${ingestIp}:5100`;
        this.OBS_NAME = obsName;
        this.GROUP_CODE = groupCode.toUpperCase();
        this.LEFT_TEAM = leftTeam;
        this.RIGHT_TEAM = rightTeam;
        this.win = win;

        if (this.ws?.connected) {
            this.enabled = false;
            this.ws.disconnect();
            this.ws = undefined;
        }
        this.ws = io.connect(this.INGEST_SERVER_URL, { reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });

        this.ws.once('obs_logon_ack', (msg) => {
            const json = JSON.parse(msg.toString());

            if (json.type === DataTypes.AUTH) {
                if (json.value === true) {
                    log.info('Authentication successful!');
                    this.win.setTitle(`Spectra Client | Connected with Group ID: ${this.GROUP_CODE}`);
                    this.enabled = true;
                    this.websocketSetup();
                } else {
                    log.info('Authentication failed!');
                    this.win.setTitle(`Spectra Client | Connection failed, invalid data`);
                    this.enabled = false;
                    this.ws?.disconnect();

                    dialog.showMessageBoxSync(win, {
                        title: "Spectra Client - Error",
                        message: "Inputted data was invalid!",
                        type: "error"
                    });
                }
            }
        });

        this.ws.on('close', () => {
            log.info('Connection to spectra server closed');
            if (this.unreachable === true) {
                this.win.setTitle(`Spectra Client | Connection failed, server not reachable`);

                dialog.showMessageBoxSync(win, {
                    title: "Spectra Client - Error",
                    message: "Spectra server not reachable!",
                    type: "error"
                });
            } else {
                this.win.setTitle(`Spectra Client | Connection closed`);
            }
            this.enabled = false;
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
            log.info(e);
        });

        this.ws.emit('obs_logon', JSON.stringify({ type: DataTypes.AUTH, obsName: this.OBS_NAME, groupCode: this.GROUP_CODE, leftTeam: this.LEFT_TEAM, rightTeam: this.RIGHT_TEAM}));
    }


    private websocketSetup() {
        this.ws?.on('message', (msg) => {
            const json = JSON.parse(msg.toString());
            log.info(json);
        });
    }

    sendToIngest(formatted: IFormattedData) {
        if (this.enabled) {
            const toSend = { obsName: this.OBS_NAME, groupCode: this.GROUP_CODE, ...formatted };
            this.ws!.emit("obs_data", JSON.stringify(toSend));
        }
    }
}