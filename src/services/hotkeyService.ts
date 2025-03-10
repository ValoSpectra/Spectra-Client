import { globalShortcut } from "electron/main";
import { ConnectorService } from "./connectorService";
import { DataTypes } from "./formattingService";
import log from "electron-log";

export default class HotkeyService {
  private static instance: HotkeyService;

  private hotkeys: Hotkey[] = [];
  private currentRoundPhase: string = "";

  private techPause: boolean = false;
  private leftTimeout: boolean = false;
  private rightTimeout: boolean = false;

  private constructor() {
    this.hotkeys[HotkeyType.SPIKE_PLANTED] = {
      key: "",
      action: this._spikePlantedHotkeyAction.bind(this),
    };
    this.hotkeys[HotkeyType.TECH_PAUSE] = {
      key: "",
      action: this._techPauseHotkeyAction.bind(this),
    };
    this.hotkeys[HotkeyType.LEFT_TIMEOUT] = {
      key: "",
      action: this._leftTimeoutHotkeyAction.bind(this),
    };
    this.hotkeys[HotkeyType.RIGHT_TIMEOUT] = {
      key: "",
      action: this._rightTimeoutHotkeyAction.bind(this),
    };
  }

  public static getInstance(): HotkeyService {
    if (HotkeyService.instance == null) HotkeyService.instance = new HotkeyService();
    return HotkeyService.instance;
  }

  public activateHotkey(key: HotkeyType) {
    const hotkey = this.hotkeys[key];
    globalShortcut.register(hotkey.key, hotkey.action);
    log.info("Activated hotkey on key " + hotkey.key);
  }

  public deactivateHotkey(key: HotkeyType) {
    const hotkey = this.hotkeys[key];
    globalShortcut.unregister(hotkey.key);
    log.info("Deactivated hotkey on key " + hotkey.key);
  }

  public activateAllHotkeys() {
    for (const hotkey of this.hotkeys) {
      globalShortcut.register(hotkey.key, hotkey.action);
    }
    log.info("Activated all hotkeys");
  }

  public deactivateAllHotkeys() {
    try {
      for (const hotkey of this.hotkeys) {
        globalShortcut.unregister(hotkey.key);
      }
      log.info("Deactivated all hotkeys");
    } catch (e) {
      log.error("Error deactivating hotkeys: " + e);
    }
  }

  public setRoundPhase(phase: string) {
    this.currentRoundPhase = phase;
  }

  public setKeyForHotkey(hotkey: HotkeyType, key: string) {
    this.hotkeys[hotkey].key = key;
  }

  private _spikePlantedHotkeyAction() {
    if (this.currentRoundPhase != "combat") return;
    const toSend = { type: DataTypes.SPIKE_PLANTED, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _techPauseHotkeyAction() {
    this.techPause = !this.techPause;
    const toSend = { type: DataTypes.TECH_PAUSE, data: this.techPause };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _leftTimeoutHotkeyAction() {
    this.leftTimeout = !this.leftTimeout;
    if (this.leftTimeout) this.rightTimeout = false;
    const toSend = { type: DataTypes.LEFT_TIMEOUT, data: this.leftTimeout };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _rightTimeoutHotkeyAction() {
    this.rightTimeout = !this.rightTimeout;
    if (this.rightTimeout) this.leftTimeout = false;
    const toSend = { type: DataTypes.RIGHT_TIMEOUT, data: this.rightTimeout };
    ConnectorService.getInstance().sendToIngest(toSend);
  }
}
export enum HotkeyType {
  SPIKE_PLANTED,
  TECH_PAUSE,
  LEFT_TIMEOUT,
  RIGHT_TIMEOUT,
}
type Hotkey = {
  key: string;
  action: () => void;
};
