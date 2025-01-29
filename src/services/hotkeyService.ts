import { globalShortcut } from "electron/main";
import { ConnectorService } from "./connectorService";
import { DataTypes } from "./formattingService";
import log from "electron-log";

export default class HotkeyService {

    private static instance: HotkeyService;

    private hotkeys: Hotkey[] = [];
    private currentRoundPhase: string = "";

    private constructor() {
        this.hotkeys[HotkeyType.SPIKE_PLANTED] = {
            key: "",
            action: this._spikePlantedHotkeyAction.bind(this)
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
        for (const hotkey of this.hotkeys) {
            globalShortcut.unregister(hotkey.key);
        }
        log.info("Deactivated all hotkeys");
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

}
export enum HotkeyType {
    SPIKE_PLANTED
}
type Hotkey = {
    key: string,
    action: () => void
}