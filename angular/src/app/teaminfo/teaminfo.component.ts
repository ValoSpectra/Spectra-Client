import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-teaminfo',
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ImageModule,
    PopoverModule
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

  protected logoImageError: boolean = false;

  protected onImageLoadError() {
    this.logoImageError = true;
  }

  protected onImageLoadSuccess() {
    this.logoImageError = false;
  }

}
type Teaminfo = {
  name?: string,
  tricode?: string,
  url?: string
}