import { Component, Input } from "@angular/core";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { BasicInfo } from "../observer.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-observerinfo",
  imports: [FormsModule, InputTextModule, FloatLabelModule, PasswordModule, SelectModule],
  templateUrl: "./observerinfo.component.html",
  styleUrl: "./observerinfo.component.css",
})
export class ObserverinfoComponent {
  protected ingestServerOptions: string[] = ["eu.valospectra.com", "na.valospectra.com"];

  @Input({ required: true })
  data!: BasicInfo;
}
