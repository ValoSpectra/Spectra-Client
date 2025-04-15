import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-seriesinfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    InputNumberModule
  ],
  templateUrl: './seriesinfo.component.html',
  styleUrl: './seriesinfo.component.css'
})
export class SeriesinfoComponent {

}
