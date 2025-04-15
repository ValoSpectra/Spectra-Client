import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-teaminfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
  ],
  templateUrl: './teaminfo.component.html',
  styleUrl: './teaminfo.component.css'
})
export class TeaminfoComponent {

  @Input()
  teaminfo: Teaminfo = {
    name: "",
    tricode: "",
    url: ""
  };

  @Input()
  title: string = "";

}
type Teaminfo = {
  name?: string,
  tricode?: string,
  url?: string
}