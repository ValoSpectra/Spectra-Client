import { Injectable } from "@angular/core";

declare global {
    interface Window {
      electronAPI: any
    }
}

@Injectable({
    providedIn: "root"
})
export class ElectronService {
    
    public get api() : any {
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
        timeoutDuration: any
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
            timeoutDuration
        )
    }

}