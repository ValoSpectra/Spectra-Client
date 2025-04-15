import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-tournamentinfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ToggleSwitchModule,
    InputNumberModule
  ],
  templateUrl: './tournamentinfo.component.html',
  styleUrl: './tournamentinfo.component.css'
})
export class TournamentinfoComponent {

}
