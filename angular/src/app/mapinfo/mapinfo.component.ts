import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-mapinfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule
  ],
  templateUrl: './mapinfo.component.html',
  styleUrl: './mapinfo.component.css'
})
export class MapinfoComponent {

  mapTimeOptions: string[] = [
    "Past", "Present", "Future"
  ]

  @Input()
  title: string = "";

  protected picker!: number;

}
