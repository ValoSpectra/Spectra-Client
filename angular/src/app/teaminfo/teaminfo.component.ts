import { Component, Injectable, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { ImageModule } from "primeng/image";
import { InputTextModule } from "primeng/inputtext";
import { PopoverModule } from "primeng/popover";
import { TeamInfo } from "../observer/observer.component";
import { TitleCasePipe } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { RadioButtonModule } from "primeng/radiobutton";
import { RadiobuttonService } from "../services/radiobutton.service";

@Component({
  selector: "app-teaminfo",
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    ImageModule,
    PopoverModule,
    TitleCasePipe,
    CheckboxModule,
    RadioButtonModule
  ],
  templateUrl: "./teaminfo.component.html",
  styleUrl: "./teaminfo.component.css",
})
export class TeaminfoComponent {
  @Input()
  teaminfo!: TeamInfo;

  @Input()
  position: "left" | "right" = "left";
  
  constructor(protected radiobuttonService: RadiobuttonService){}

  protected logoImageError: boolean = false;

  protected onImageLoadError() {
    this.logoImageError = true;
  }

  protected onImageLoadSuccess() {
    this.logoImageError = false;
  }
}
