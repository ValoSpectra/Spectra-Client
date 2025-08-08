import { globalShortcut } from "electron/main";
import { ConnectorService } from "./connectorService";
import { DataTypes } from "./formattingService";
import log from "electron-log";

export default class HotkeyService {
  private static instance: HotkeyService;

  private hotkeys: Hotkey[] = [];
  private currentRoundPhase: string = "";

  private techPause: boolean = false;

  private constructor() {
    this.hotkeys[HotkeyType.SPIKE_PLANTED] = {
      key: "",
      action: this._spikePlantedHotkeyAction.bind(this),
      type: HotkeyType.SPIKE_PLANTED,
      enabled: false,
    };
    this.hotkeys[HotkeyType.TECH_PAUSE] = {
      key: "",
      action: this._techPauseHotkeyAction.bind(this),
      type: HotkeyType.TECH_PAUSE,
      enabled: true,
    };
    this.hotkeys[HotkeyType.LEFT_TIMEOUT] = {
      key: "",
      action: this._leftTimeoutHotkeyAction.bind(this),
      type: HotkeyType.LEFT_TIMEOUT,
      enabled: true,
    };
    this.hotkeys[HotkeyType.RIGHT_TIMEOUT] = {
      key: "",
      action: this._rightTimeoutHotkeyAction.bind(this),
      type: HotkeyType.RIGHT_TIMEOUT,
      enabled: true,
    };
    this.hotkeys[HotkeyType.SWITCH_KDA_CREDITS] = {
      key: "",
      action: this._switchKdaCreditsHotkeyAction.bind(this),
      type: HotkeyType.SWITCH_KDA_CREDITS,
      enabled: true,
    };
  }

  public static getInstance(): HotkeyService {
    if (HotkeyService.instance == null) HotkeyService.instance = new HotkeyService();
    return HotkeyService.instance;
  }

  protected activateHotkey(key: HotkeyType) {
    const hotkey = this.hotkeys[key];
    if (hotkey.enabled) {
      globalShortcut.register(hotkey.key, hotkey.action);
      log.info(`Activated hotkey ${HotkeyType[hotkey.type]} on key ${hotkey.key}`);
    }
  }

  protected deactivateHotkey(key: HotkeyType) {
    const hotkey = this.hotkeys[key];
    globalShortcut.unregister(hotkey.key);
    log.info(`Deactivated hotkey ${HotkeyType[hotkey.type]} on key ${hotkey.key}`);
  }

  public activateAllHotkeys() {
    for (const hotkey of this.hotkeys) {
      this.activateHotkey(hotkey.type);
    }
    log.info("Activated all enabled hotkeys");
  }

  public deactivateAllHotkeys() {
    try {
      for (const hotkey of this.hotkeys) {
        if (hotkey.key == "") continue;
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

  public setKeyForHotkey(hotkey: HotkeyType, key: string, enabled: boolean = true) {
    const regex = /^(Ctrl\+|Alt\+|Shift\+)*(\D|F[1-9][0-1]?|\d)$/g;
    if (key.match(regex) || !enabled) {
      this.hotkeys[hotkey].key = key;
      this.hotkeys[hotkey].enabled = enabled;
    } else {
      throw new Error(`The hotkey on ${key} is invalid!`);
    }
  }

  private _spikePlantedHotkeyAction() {
    if (this.currentRoundPhase != "combat") return;
    const toSend = { type: DataTypes.SPIKE_PLANTED, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _techPauseHotkeyAction() {
    this.techPause = !this.techPause;
    const toSend = { type: DataTypes.TECH_PAUSE, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _leftTimeoutHotkeyAction() {
    const toSend = { type: DataTypes.LEFT_TIMEOUT, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _rightTimeoutHotkeyAction() {
    const toSend = { type: DataTypes.RIGHT_TIMEOUT, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }

  private _switchKdaCreditsHotkeyAction() {
    const toSend = { type: DataTypes.SWITCH_KDA_CREDITS, data: true };
    ConnectorService.getInstance().sendToIngest(toSend);
  }
}
export enum HotkeyType {
  SPIKE_PLANTED,
  TECH_PAUSE,
  LEFT_TIMEOUT,
  RIGHT_TIMEOUT,
  SWITCH_KDA_CREDITS,
}
type Hotkey = {
  key: string;
  action: () => void;
  type: HotkeyType;
  enabled: boolean;
};
