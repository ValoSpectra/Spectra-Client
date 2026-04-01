import { EventEmitter, Injectable, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Injectable({
  providedIn: "root",
})
export class ElectronService {
  constructor() {
    this.api.onSpectraStatusChange(this.changeSpectraStatus.bind(this));
    this.api.onGameStatusChange(this.changeGameStatus.bind(this));
    this.api.fireConnect(this.receiveFireConnectEvent.bind(this));
    this.api.setPlayerName(this.changePlayername.bind(this));
    this.api.setInputAllowed(this.changeInputAllowed.bind(this));
    this.api.setLoadingStatus(this.changeLoadingStatus.bind(this));
    this.api.setEventStatus(this.changeEventStatus.bind(this));
    this.api.onDiscordInfo(this.changeDiscordInfo.bind(this));
    this.api.onTriggerSendToast(this.onTriggerSendToast.bind(this));
  }

  public get api(): any {
    return window.electronAPI;
  }

  public processInputs(
    ingestIp: any,
    groupId: any,
    obsName: any,
    leftTeam: any,
    rightTeam: any,
    key: any,
    seriesInfo: any,
    seedingInfo: any,
    tournamentInfo: any,
    hotkeys: any,
    sponsorInfo: any,
    watermarkInfo: any,
    playercamsInfo: any,
    timeoutInfo: any,
    roundWinBox: any,
  ) {
    this.api.processInputs(
      ingestIp,
      groupId,
      obsName,
      leftTeam,
      rightTeam,
      key,
      seriesInfo,
      seedingInfo,
      tournamentInfo,
      hotkeys,
      sponsorInfo,
      watermarkInfo,
      playercamsInfo,
      timeoutInfo,
      roundWinBox,
    );
  }

  public openExternalLink(link: string) {
    this.api.openExternalLink(link);
  }

  private spectraStatusMessageSource = new BehaviorSubject<Status>({
    statusType: StatusTypes.NEUTRAL,
    message: "Initializing",
  });
  public spectraStatusMessage = this.spectraStatusMessageSource.asObservable();

  protected changeSpectraStatus(status: Status) {
    this.spectraStatusMessageSource.next(status);
  }

  private gameStatusMessageSource = new BehaviorSubject<Status>({
    statusType: StatusTypes.NEUTRAL,
    message: "Waiting",
  });
  public gameStatusMessage = this.gameStatusMessageSource.asObservable();

  protected changeGameStatus(status: Status) {
    this.gameStatusMessageSource.next(status);
  }

  @Output()
  fireConnect = new EventEmitter<void>();
  protected receiveFireConnectEvent(value: any) {
    this.fireConnect.emit(value);
  }

  public processAuxInputs(serverIp: string, observerName: string) {
    this.api.processAuxInputs(serverIp, observerName);
  }

  private playernameMessageSource = new BehaviorSubject<string>("");
  public playernameMessage = this.playernameMessageSource.asObservable();

  protected changePlayername(name: string) {
    this.playernameMessageSource.next(name);
  }

  public setTraySetting(setting: boolean) {
    this.api.setTraySetting(setting);
  }

  public setStartupSettings(enabled: boolean, startMinimized: boolean, aux = false) {
    this.api.setStartupSettings(enabled, startMinimized, aux);
  }

  // Close confirmation flow
  public onConfirmClose(callback: () => void) {
    this.api.onConfirmClose(callback);
  }

  public confirmCloseDecision(confirm: boolean) {
    this.api.confirmCloseDecision(confirm);
  }

  private inputAllowedMessageSource = new BehaviorSubject<boolean>(true);
  public inputAllowedMessage = this.inputAllowedMessageSource.asObservable();

  protected changeInputAllowed(value: boolean) {
    this.inputAllowedMessageSource.next(value);
  }

  private loadingStatusMessageSource = new BehaviorSubject<boolean>(true);
  public loadingStatusMessage = this.loadingStatusMessageSource.asObservable();

  protected changeLoadingStatus(value: boolean) {
    this.loadingStatusMessageSource.next(value);
  }

  public overrideLoadingStatus(value: boolean) {
    this.loadingStatusMessageSource.next(value);
  }

  public sendMidmatchEvent(type: MidMatchEventTypes) {
    this.api.sendMidmatchEvent(type);
  }

  public sendToast(toast: any) {
    if (!this.api.sendToast) return;
    this.api.sendToast(toast);
  }

  @Output()
  fireSendToast = new EventEmitter<void>();
  public onTriggerSendToast() {
    this.fireSendToast.emit();
  }

  private eventStatusMessageSource = new BehaviorSubject<number>(1);
  public eventStatusMessage = this.eventStatusMessageSource.asObservable();

  protected changeEventStatus(value: number) {
    this.eventStatusMessageSource.next(value);
  }

  protected changeDiscordInfo(value: any) {
    localStorage.setItem("discordInfo", JSON.stringify(value));
  }
}

export enum StatusTypes {
  NEUTRAL = "info",
  RED = "danger",
  YELLOW = "warn",
  GREEN = "success",
}
export type Status = {
  statusType: StatusTypes;
  message: string;
};
export type MidMatchEventTypes = "toast" | "swap_left_right" | "swap_attacker_defender";
export type IToastInfo = {
  duration: number | null;
  message: string;
  eventLogoEnabled: boolean;
  selectedTeam?: "left" | "right";
  active: boolean;
};
