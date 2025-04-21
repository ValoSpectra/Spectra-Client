import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { BasicInfo } from "../observer.component";
import { FormsModule } from "@angular/forms";
import { ElectronService } from "../../services/electron.service";

@Component({
  selector: "app-observerinfo",
  imports: [FormsModule, InputTextModule, FloatLabelModule, PasswordModule, SelectModule],
  templateUrl: "./observerinfo.component.html",
  styleUrl: "./observerinfo.component.css",
})
export class ObserverinfoComponent implements OnInit {
  protected ingestServerOptions: string[] = ingestServerOptions;

  constructor(
    protected electron: ElectronService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.electron.playernameMessage.subscribe((name: string) => {
      this.data.name = name;
      this.changeDetectorRef.detectChanges();
    });
  }

  @Input({ required: true })
  data!: BasicInfo;
}

export const ingestServerOptions = ["eu.valospectra.com", "na.valospectra.com"];
