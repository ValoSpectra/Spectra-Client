import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { BlockableDiv } from '../blockablediv/blockablediv.component';

@Component({
  selector: 'app-tournamentinfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ToggleSwitchModule,
    InputNumberModule,
    BlockUIModule,
    BlockableDiv
  ],
  templateUrl: './tournamentinfo.component.html',
  styleUrl: './tournamentinfo.component.css'
})
export class TournamentinfoComponent {

  protected enabled: boolean = false;

}
