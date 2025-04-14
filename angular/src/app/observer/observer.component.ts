import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-observer',
  imports: [
    InputTextModule,
    FormsModule,
    IftaLabelModule,
    RadioButtonModule,
    ButtonModule
  ],
  templateUrl: './observer.component.html',
  styleUrl: './observer.component.css'
})
export class ObserverComponent {

  protected key: string = "";
  protected groupCode: string = "DEBUG";
  protected ingestServerIp: string = "https://eu.valospectra.com";
  protected leftTeamInfo: any = {
    name: "Wachunpelo Pelupelu Gamers",
    tricode: "PELU",
    url: "https://dnkl.gg/QL3ls"
  };
  protected rightTeamInfo: any = {
    name: "Ok'hanu Ohokaliy Enjoyers",
    tricode: "HANU",
    url: "https://dnkl.gg/PEAsu"
  };

  protected onConnectClick() {

    const seriesInfo = {
      needed: 1,
      wonLeft: 0,
      wonRight: 0,
      mapInfo: [],
    };

    const seedingInfo = {
      left: "",
      right: "",
    };

    const emptyTournamentInfo = {
      name: "",
      logoUrl: "",
      backdropUrl: "",
    };

    const hotkeys = {
      spikePlanted: "F9",
      techPause: "F10",
      leftTimeout: "O",
      rightTimeout: "P",
    };
    
    window.electronAPI.processInputs(
      this.ingestServerIp,
      this.groupCode,
      "Tiranthine",
      {
        ...this.leftTeamInfo,
        attackStart: false
      },
      {
        ...this.rightTeamInfo,
        attackStart: true
      },
      this.key,
      seriesInfo,
      seedingInfo,
      emptyTournamentInfo,
      hotkeys,
      60
    );
  }

}
